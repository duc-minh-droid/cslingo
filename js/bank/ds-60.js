/* js/bank/ds-60.js: Data Science lecture 16 revision questions, part 2: ds16-partition, ds16-workload and ds16-stack. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds16;

  B.add("ds16-partition", [
    mc(
      "What is partitioning in co-design?",
      [
        "Allocating functions between hardware and software",
        "Splitting a dataset into training and test parts",
        "Dividing a chip's memory between programs",
      ],
      "Partitioning decides which functions are done in hardware and which in software.",
    ),
    {
      type: "cat",
      q: "A smart thermostat team partitions its functions. Where does each go?",
      buckets: ["Hardware", "Software"],
      items: [
        ["Sampling the temperature sensor every millisecond", 0],
        ["A fixed noise filter run on every sample", 0],
        ["The heating schedule users edit", 1],
        ["Energy-saving tips updated monthly", 1],
      ],
      why: "Hardware gives speed and parallelism to heavy, stable work; software gives flexibility and easy updates.",
    },
    mc(
      "What does software offer that hardware does not, in a partition?",
      ["Flexibility and easy updates", "Higher speed for the same job", "More parallelism"],
      "Hardware is chosen for speed and parallelism; software for flexibility and ease of updates.",
    ),
    mc(
      "Before building a chip, a team models how it and its code will interact. What is this?",
      ["Prototyping and simulation", "Platform-based design", "Profiling in production"],
      "Co-design uses prototyping and simulation tools, often with HDLs, to model the hardware–software interaction.",
    ),
    mc(
      "What does an HDL describe?",
      ["Hardware", "A training dataset", "A user interface"],
      "A hardware description language describes hardware, so it can be simulated and synthesised.",
    ),
    {
      type: "match",
      q: "Match each technique to what it does.",
      pairs: [
        ["High-level synthesis", "Turns a behaviour description into an HDL design"],
        ["Platform-based design", "Starts from a ready set of hardware and software parts"],
        ["Simulation", "Models how chip and code will interact"],
      ],
      why: "High-level synthesis automates the step from behaviour to hardware; platform-based design reuses a predefined platform to cut time; simulation tests before building.",
    },
    mc(
      "Why start from a predefined platform?",
      [
        "It can greatly reduce design time and complexity",
        "It always gives the fastest possible chip",
        "It removes the need for any software",
      ],
      "Platform-based design starts from hardware and software components that already work together, which saves time and complexity.",
    ),
  ]);

  B.add("ds16-workload", [
    {
      type: "order",
      q: "Put the three moves of a co-design decision in order.",
      items: ["Identify the slow or costly function", "Choose a suitable processor", "Check the cost of moving data"],
      why: "Find what is slow, pick where it should run, then make sure moving its data there does not cancel the gain.",
    },
    {
      type: "multi",
      q: "When profiling a workload, what does the lecture say to record or find? Select all that apply.",
      o: [
        "What dominates time or energy",
        "The input size",
        "The batch size",
        "The programmer's name",
        "The colour of the user interface",
      ],
      a: [0, 1, 2],
      why: "Profile on realistic inputs, find what dominates time or energy, and record input and batch size.",
    },
    mc(
      "Why profile on realistic inputs rather than tiny test cases?",
      [
        "Tiny inputs can hide what really dominates",
        "Realistic inputs make the code run faster",
        "Profilers only accept large files",
      ],
      "What dominates time or energy can change with input and batch size, so the profile must reflect real use.",
    ),
    mc(
      "A speech app moves its model to a fast accelerator but gets no quicker. What should it check first?",
      ["The cost of moving data", "The colour of the app icon", "The number of users"],
      "Moving data may cost more than computing on it; the copies to and from the accelerator can eat the gain.",
    ),
    mc(
      "How can a design cut the cost of data movement?",
      [
        "Keep frequently used data near the processor",
        "Copy the data more often so it stays in sync",
        "Use a faster processor in another machine",
      ],
      "Keeping frequently used data close to where it is processed avoids repeated transfers.",
    ),
    {
      type: "cat",
      q: "Which processor suits each job best?",
      buckets: ["CPU", "GPU", "Specialised chip"],
      items: [
        ["Handling a web request with many branches", 0],
        ["Running an operating system's scheduler", 0],
        ["Adding two huge matrices element by element", 1],
        ["Rendering millions of pixels at once", 1],
        ["A fixed video codec run all day", 2],
        ["The same stable network on every frame", 2],
      ],
      why: "CPU: varied tasks and control flow. GPU: similar calculations in parallel. Specialised chip: frequent, stable operations.",
    },
  ]);

  B.add("ds16-stack", [
    {
      type: "order",
      q: "Put image classification on a CPU and GPU in order.",
      items: [
        "CPU loads and prepares the image",
        "The input is copied to the GPU",
        "GPU runs the neural network",
        "The result is copied back",
        "CPU presents the result",
      ],
      why: "The CPU prepares and presents; the GPU runs the matrix-heavy model; copies move the data between them.",
    },
    {
      type: "match",
      q: "Match each layer of the software stack to its job.",
      pairs: [
        ["Framework", "Expresses the model"],
        ["Compiler", "Selects hardware-specific operations"],
        ["Runtime", "Schedules work and memory"],
      ],
      why: "The framework describes the model, the compiler maps it to the chip's operations, and the runtime schedules it while running.",
    },
    mc(
      "A team measures how long one request takes from start to finish. What is that?",
      ["End-to-end latency", "Throughput", "Energy per result"],
      "Latency is the time for one result end to end; throughput is results per unit of time.",
    ),
    {
      type: "multi",
      q: "Which belong in the lecture's iterate step? Select all that apply.",
      o: [
        "Prototype before committing to new hardware",
        "Measure the complete pipeline",
        "Revisit the partition as bottlenecks shift",
        "Fix the partition forever after the first design",
        "Measure only the fastest stage",
      ],
      a: [0, 1, 2],
      why: "Prototype first, measure end to end, and revisit the partition because speeding one part up moves the bottleneck.",
    },
    mc(
      "Which advantage of co-design means weighing power, performance, cost and development time?",
      ["Design-space exploration", "High-level synthesis", "Edge computing"],
      "Co-design lets designers explore a wider range of options and the trade-offs between those factors.",
    ),
    {
      type: "multi",
      q: "Which areas does the lecture name as benefiting from co-design? Select all that apply.",
      o: ["Embedded systems", "Consumer electronics", "Automotive", "Telecommunications (5G)", "Printed newspapers"],
      a: [0, 1, 2, 3],
      why: "Embedded systems, consumer electronics, the automotive industry and telecommunications such as 5G.",
    },
    mc(
      "At which levels does co-design enable optimisation?",
      ["System, architecture and algorithm", "Only the algorithm level, in the code", "Only the transistor level, in silicon"],
      "The slides list system-level, architectural-level and algorithmic-level optimisation.",
    ),
  ]);
})();

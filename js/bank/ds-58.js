/* js/bank/ds-58.js: Data Science lecture 15 revision questions, part 2: ds15-amdahl, ds15-resources and ds15-slurm. */
(function () {
  const B = NIC.bank;
  const mc = (q, o, why, hint) => ({ q, o, a: 0, why, ...(hint ? { hint } : {}) });

  B.add("ds15-amdahl", [
    mc(
      "What does Amdahl's law predict?",
      [
        "The speedup from using more processors",
        "How often transistor counts on chips double",
        "Which pending job the scheduler runs next",
      ],
      "Amdahl's law predicts the theoretical speedup of a task when it runs on multiple processors.",
    ),
    mc(
      "By Amdahl's law, what bounds the speedup?",
      [
        "The sequential part of the work",
        "The number of users logged in to the cluster",
        "The position of the job in the Slurm queue",
      ],
      "However many processors you add, the sequential part still takes its full time, so it caps the speedup.",
    ),
    {
      type: "match",
      q: "Match each symbol in Amdahl's law to its meaning.",
      pairs: [
        ["S<sub>latency</sub>", "Speedup of the whole task"],
        ["s", "Speedup of the part that gets more resources"],
        ["p", "That part's share of the original run time"],
      ],
      why: "S_latency is the overall speedup, s is the speedup of the improved part, and p is the proportion of the original time that part took.",
    },
    mc(
      "Two jobs run on the same 64 processors. Job A is 99% shareable, job B is 50% shareable. Which speeds up more?",
      ["Job A", "Job B", "Both speed up equally"],
      "The bigger the shareable part (p), the smaller the sequential part, and the higher the ceiling on speedup.",
    ),
    mc(
      "In the slide's example (10 single sums in order plus a 10 × 10 matrix sum), why do ten processors give less than a 10× speedup?",
      [
        "The 10 single sums still run one after another",
        "The matrix sum cannot be shared at all",
        "Ten processors make each sum slower",
      ],
      "The 100 matrix additions are shared ten ways, but the 10 scalar sums are sequential, so the whole job only gets about 5.5× faster.",
    ),
    {
      type: "cat",
      q: "In a storm model, which work can be shared out and which must run in order?",
      buckets: ["Can be shared", "Must run in order"],
      items: [
        ["Updating the weather in many separate map squares", 0],
        ["Adding two big grids of numbers cell by cell", 0],
        ["Ten sums where each needs the result of the last", 1],
        ["A final step only one processor can do", 1],
      ],
      why: "Independent pieces of work can be split across processors; steps that depend on each other, or that only one processor can do, form the sequential part.",
    },
  ]);

  B.add("ds15-resources", [
    {
      type: "multi",
      q: "Select everything the slides include in a supercomputer's cost of ownership.",
      o: [
        "Dedicated system administrators",
        "Support contracts or a maintenance crew",
        "Electricity to power and cool it",
        "The users' laptops",
        "The software users write",
      ],
      a: [0, 1, 2],
      why: "The hosting data centre pays system administrators, support or maintenance, and electricity to power and cool the machine.",
    },
    {
      type: "cat",
      q: "Which of the three resource-management tasks is each one?",
      buckets: ["Resource allocation", "Workload scheduling", "Execution and monitoring"],
      items: [
        ["Giving a job four nodes and one GPU", 0],
        ["Choosing which pending job runs next", 1],
        ["Starting a job's tasks across many nodes and watching them", 2],
      ],
      why: "Allocation assigns hardware, scheduling decides who runs when, and execution and monitoring launches the work and keeps an eye on it.",
    },
    {
      type: "multi",
      q: "Select every resource type the slides say resource managers recognise.",
      o: ["Compute nodes", "Processing cores", "Interconnect", "Permanent storage", "Accelerators", "User passwords"],
      a: [0, 1, 2, 3, 4],
      why: "The slides list compute nodes, processing cores, interconnect, permanent storage and accelerators.",
    },
    mc(
      "What is a job, in resource-management terms?",
      [
        "A self-contained unit of work and its data",
        "One core inside a processor on a node",
        "A partition of the cluster's compute nodes",
      ],
      "A job is a self-contained work unit with its input data; when it runs it produces output data.",
    ),
    mc(
      "What decides the order in which pending jobs are picked to run?",
      ["The job queue", "The size of each job's output", "The order users logged in"],
      "Pending jobs are stored in queues, and the queue defines the order the resource manager selects them in.",
    ),
    {
      type: "cat",
      q: "Interactive or batch?",
      buckets: ["Interactive", "Batch"],
      items: [
        ["You type commands and watch the results live", 0],
        ["You test a small model step by step at the keyboard", 0],
        ["You submit a long run tonight and read the output tomorrow", 1],
        ["A job script waits in the queue and runs unattended", 1],
      ],
      why: "Interactive jobs are run live while you watch; batch jobs are handed in, queued, and run without you.",
    },
  ]);

  B.add("ds15-slurm", [
    {
      type: "match",
      q: "Match each Slurm command to what it does.",
      pairs: [
        ["sbatch", "Submit a batch job"],
        ["squeue", "Check jobs waiting in the queue"],
        ["srun", "Launch parallel tasks in an allocation"],
        ["sacct", "Inspect a job's record afterwards"],
      ],
      why: "sbatch submits, squeue shows the queue, srun launches tasks inside the allocation, and sacct shows the job record after completion.",
    },
    mc(
      "In Slurm, what is a partition?",
      [
        "A set of nodes acting as a job queue",
        "A single task inside a running job",
        "A file that stores a job's final output",
      ],
      "Nodes are divided into logical sets called partitions; each one is a job queue with its own constraints.",
    ),
    mc(
      "How does Slurm's scheduler hand out free nodes?",
      [
        "Highest priority first, until none are free",
        "Equally to every job waiting in the queue",
        "To whichever job has the smallest input file",
      ],
      "The scheduler assigns available nodes to the highest-priority jobs until the pool of free nodes is exhausted.",
    ),
    mc(
      "What is a job step?",
      [
        "One task within a job, on some or all its nodes",
        "A partition with extra constraints on its jobs",
        "The time a job spends waiting in the Slurm queue",
      ],
      "A job's individual tasks are job steps. Each may use the job's whole allocation or only part of it.",
    ),
    {
      type: "multi",
      q: "Select every word the slides use to describe Slurm.",
      o: ["Open-source", "Modular", "Extensible", "Scalable", "Single-user", "Windows-only"],
      a: [0, 1, 2, 3],
      why: "Slurm is described as an open-source, modular, extensible, scalable resource manager and workload scheduler.",
    },
    {
      type: "order",
      q: "Put a Slurm job's life in order.",
      items: [
        "Submit it with sbatch",
        "It waits in the queue (check with squeue)",
        "Nodes are allocated and srun launches tasks",
        "Read its record with sacct",
      ],
      why: "Submit, queue, allocate and run, then inspect the record.",
    },
  ]);
})();

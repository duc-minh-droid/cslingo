/* Data Science Lecture 15 (high-performance computing): the boss quiz. New scenario: the Larkspur Museum turns
   thousands of fossil photos into 3D models on a borrowed cluster called Ammonite. No calculation questions. */
(function () {
  NIC.registerBoss({
    id: "ds15-boss",
    subject: "ds",
    lecture: 15,
    title: "Lecture 15 boss quiz",
    blurb:
      "Ten questions set at a museum: HPC building blocks, FLOPS, Moore's and Amdahl's laws, resource management and Slurm.",
    lede: "A new scenario: the <b>Larkspur Museum</b> is turning thousands of fossil photos into 3D models before its new gallery opens. It has borrowed time on <b>Ammonite</b>, a Slurm cluster. Help the curators get their jobs through.",
    qs: [
      {
        type: "match",
        q: "Match each idea the curators keep hearing about to what it means.",
        pairs: [
          ["FLOPS", "Floating-point operations a machine does per second"],
          ["Moore's law", "Transistors on a chip double about every two years"],
          ["Amdahl's law", "Speedup is capped by the part that cannot be parallelised"],
          ["Slurm", "Open-source resource manager and workload scheduler"],
        ],
        why: "FLOPS measures processing power; Moore's law is about transistor counts; Amdahl's law bounds the speedup from more processors; Slurm manages and schedules a cluster's resources.",
      },
      {
        type: "order",
        q: "Put these speed units in order, from smallest to largest.",
        items: ["gigaFLOPS", "teraFLOPS", "petaFLOPS", "exaFLOPS"],
        why: "Giga (10⁹), tera (10¹²), peta (10¹⁵), exa (10¹⁸): each is a thousand times the one before.",
      },
      {
        type: "cat",
        q: "Which part of a high-performance system is each museum problem about?",
        buckets: ["Processing power", "Communication", "I/O"],
        items: [
          ["The 3D sums take hours even on a fast node", 0],
          ["More cores per processor would finish the meshes sooner", 0],
          ["Nodes wait for each other's halves of a skull over a slow network", 1],
          ["The LAN between nodes is busy all day", 1],
          ["Loading 40 000 photos from disk takes longer than processing them", 2],
          ["Writing the finished models to storage is the bottleneck", 2],
        ],
        why: "Processing power is doing the sums, communication is moving data between nodes over the network, and I/O is reading and writing storage.",
      },
      {
        type: "mcq",
        q: "Every model needs a final 'stitching' stage that only one processor can do. The curators double their nodes from 64 to 128 and the run barely speeds up. Why?",
        o: [
          "The stitching stage takes as long as ever",
          "Ammonite's network blocks the extra nodes",
          "Doubling nodes halves the FLOPS per node",
          "Slurm only lets half of the nodes run",
        ],
        a: 0,
        why: "Amdahl's law: the speedup is bounded by the sequential part. Extra nodes only shrink the shareable work, and the stitching stage still runs at its full length.",
      },
      {
        type: "multi",
        q: "Ammonite's host data centre adds up its cost of ownership. Select every item that belongs in it.",
        o: [
          "Dedicated system administrators",
          "Support contracts or a maintenance crew",
          "Electricity to power the machine",
          "Electricity to cool the machine",
          "The museum's photo licences",
          "The curators' gallery tickets",
        ],
        a: [0, 1, 2, 3],
        why: "The slides list system administrators, support contracts or a maintenance crew, and the electricity to power and cool the machine. The museum's own costs are not part of the cluster's ownership.",
      },
      {
        type: "order",
        q: "Put the life of the museum's render job in order.",
        items: [
          "Submit the batch job with sbatch",
          "Check it waiting in the queue with squeue",
          "Slurm allocates nodes; srun launches parallel tasks",
          "Inspect the finished job's record with sacct",
        ],
        why: "sbatch submits, the job waits in a queue (check with squeue), Slurm allocates nodes and srun launches tasks inside the allocation, and sacct shows the record afterwards.",
      },
      {
        type: "bug",
        q: "A curator wrote notes beside each command. Tap the line whose note is wrong.",
        code: [
          "sbatch render.sh      # submit the render as a batch job",
          "squeue -u curator     # see whether it is pending or running",
          "srun -n 8 ./mesh      # launch 8 parallel tasks in the allocation",
          "sacct -j 812          # cancel the job before it starts",
        ],
        a: 3,
        hint: "Which command is for after the job has run?",
        why: "sacct shows a job's accounting record after it has completed; it does not cancel anything.",
      },
      {
        type: "cat",
        q: "Which task of the resource manager is each event?",
        buckets: ["Resource allocation", "Workload scheduling", "Execution and monitoring"],
        items: [
          ["Two GPU nodes are assigned to the texture job", 0],
          ["The render job gets 16 cores and some storage", 0],
          ["The urgent job is picked from the queue before the others", 1],
          ["Jobs are lined up to run overnight", 1],
          ["Tasks are started on eight nodes at once", 2],
          ["A failed task on one node is spotted and reported", 2],
        ],
        why: "Allocation hands out hardware, scheduling decides which job runs when, and execution and monitoring starts the work across nodes and watches it.",
      },
      {
        type: "mcq",
        q: "The texture job needs a GPU, but it was sent to Ammonite's cpu partition, which has none. What happens?",
        o: [
          "It stays pending in that partition",
          "Slurm moves it to the gpu partition",
          "It runs on CPUs without its GPU",
          "It replaces the highest-priority job",
        ],
        a: 0,
        why: "A partition is a job queue with its own constraints. If it cannot offer what the job asks for, the job just waits; the curator must send it to the right partition.",
      },
      {
        type: "multi",
        q: "Select every statement about jobs that matches the lecture.",
        o: [
          "A job is a self-contained unit of work with input data",
          "A job can be split into smaller steps",
          "A job can run interactively or as a batch",
          "Pending jobs wait in a queue that sets their order",
          "A job must always use every node in the cluster",
          "Jobs run in the order their files were created",
        ],
        a: [0, 1, 2, 3],
        why: "Jobs are self-contained work units that produce output, can be monolithic or split into steps, run interactively or as a batch, and wait in queues. Job steps may use all of a job's nodes or only some, and the queue (not file dates) sets the order.",
      },
    ],
  });
})();

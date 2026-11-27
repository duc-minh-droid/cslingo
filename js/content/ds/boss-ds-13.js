/* Data Science Lecture 13 (thread-level parallelism): the boss quiz. New scenario: Starling, a small observatory that
   cleans up thousands of night-sky photos on its 8-core server, and later across a cluster of machines. */
(function () {
  NIC.registerBoss({
    id: "ds13-boss",
    subject: "ds",
    lecture: 13,
    title: "Lecture 13 boss quiz",
    blurb:
      "Ten questions set at an observatory: levels of parallelism, SIMD and MIMD, threads, OpenMP fork-join and MPI.",
    lede: "A new scenario: <b>Starling</b> is a small observatory. Every night it cleans thousands of sky photos, first on one 8-core server, then on a small cluster of machines. Pick the right kind of parallelism at every turn.",
    qs: [
      {
        type: "match",
        q: "Match each Starling term to what it means.",
        pairs: [
          ["Thread", "A semi-independent stream of execution inside a process"],
          ["Process", "A running program with its own memory"],
          ["Fork", "The master thread spawns worker threads"],
          ["Join", "A synchronisation point where all threads have finished"],
        ],
        why: "Threads live inside a process and share its memory; processes have their own. In fork-join, the fork spawns the workers and the join waits for them all.",
      },
      {
        type: "cat",
        q: "Sort each Starling set-up into its architecture.",
        buckets: ["SISD", "SIMD", "MIMD"],
        items: [
          ["An old single-core laptop processes one photo at a time", 0],
          ["One instruction brightens 8 photos at once, each on its own processor", 1],
          ["One core detects stars while another compresses a different file", 2],
          ["Every processor applies the same blur filter to its own tile of a photo", 1],
          ["Each server in the cluster runs its own program on its own data", 2],
        ],
        why: "Count the streams. One instruction and one data stream is SISD. One instruction on many data streams is SIMD. Each processor with its own instructions and data is MIMD.",
      },
      {
        type: "mcq",
        q: "Starling's first version starts a whole new process for every photo. Why is that slow compared with threads?",
        o: [
          "Spawning processes is expensive: each needs its own memory",
          "Processes cannot run on a multi-core processor at all",
          "Processes must always wait for each other to finish",
        ],
        a: 0,
        why: "Spawning individual processes to achieve parallelism is expensive. Threads live inside one process and share its memory, so they are lightweight.",
      },
      {
        type: "multi",
        q: "Starling's cleaner runs as one process with 8 threads. Which statements are true? Pick all that apply.",
        o: [
          "The threads can read the same global variables",
          "The threads can share the same open file",
          "Each thread can run on a different core",
          "Each thread gets a private copy of all the data",
        ],
        a: [0, 1, 2],
        why: "Threads share memory with each other, such as global variables and file descriptors, and are assigned to different physical cores. They do not get private copies of the process's data.",
      },
      {
        type: "mcq",
        q: "Starling's server has run out of cores, so they add a second server. Can the threaded cleaner use both servers' cores as one shared memory program?",
        o: [
          "No: shared memory needs cores that share memory, on one node",
          "Yes: threads move freely between any connected servers",
          "Yes, as long as each server runs exactly the same number of threads",
        ],
        a: 0,
        why: "Shared memory systems require the cores to share memory, so a threaded program runs on a single node. Across machines you need distributed memory and messages.",
      },
      {
        type: "order",
        q: "Put one OpenMP-style parallel region of Starling's cleaner in order.",
        items: [
          "The master thread runs alone and loads the night's photos",
          "The master forks worker threads",
          "Each thread cleans its own share of the photos",
          "All threads meet at the join",
          "The master carries on alone and writes the log",
        ],
        why: "A fork-join segment: the master runs sequentially, forks workers, they compute separately, they synchronise at the join, and the master continues alone.",
      },
      {
        type: "mcq",
        q: "A Starling astronomer wants the photo loop to run in parallel with OpenMP. What does she have to do?",
        o: [
          "Mark the loop to parallelise and let the compiler do the rest",
          "Write the code to send each photo to a thread as a message",
          "Start every worker thread by hand and number it herself",
        ],
        a: 0,
        why: "OpenMP's parallelism is implicit: you specify which parts of the program to parallelise, and the compiler produces a parallel executable.",
      },
      {
        type: "mcq",
        q: "On the cluster, the process with rank 0 sends the night's star count to rank 3. Rank 3 posts a receive expecting a message from rank 1. What happens?",
        o: [
          "The receive does not match, so rank 3 does not get it",
          "Rank 3 gets the count, since the destination was right",
          "MPI quietly redirects the count to rank 1 instead",
        ],
        a: 0,
        why: "Messages are two-sided: the send names the data and the destination, and the receive must match the sender's process number. Rank 3 is waiting for rank 1.",
      },
      {
        type: "cat",
        q: "Starling uses two styles of parallelism. Sort each feature.",
        buckets: ["Shared memory (threads)", "Distributed memory (MPI)"],
        items: [
          ["Every worker can see the parent's data", 0],
          ["Each worker sees only its own data", 1],
          ["Workers exchange explicit messages", 1],
          ["Limited to the cores of one node", 0],
          ["Data is split into sub-problems across machines", 1],
          ["Usually programmed with OpenMP", 0],
        ],
        why: "Threads share their process's memory on one node (OpenMP). In distributed memory each process sees only its own data and communicates by messages (MPI).",
      },
      {
        type: "multi",
        q: "Starling's cluster runs 9 MPI processes, split into three groups of 3. Which statements are true? Pick all that apply.",
        o: [
          "MPI_COMM_WORLD contains all 9 processes",
          "In each group the ranks run 0, 1, 2",
          "A process can belong to the world and to its group",
          "Ranks in the world start from 1",
        ],
        a: [0, 1, 2],
        why: "The World communicator holds every process of the session; ranks start from 0 in every communicator; and a process can be associated with more than one communicator.",
      },
    ],
  });
})();

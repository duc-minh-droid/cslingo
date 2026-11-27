/* js/bank/ds-53.js: Data Science lecture 13 revision questions, part 1: ds13-levels, ds13-flynn and ds13-threads. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds13;

  B.add("ds13-levels", [
    {
      type: "multi",
      q: "At which levels can parallelism happen, as well as across whole machines? Pick all that apply.",
      o: ["Process", "Thread", "Instruction", "Data"],
      a: [0, 1, 2, 3],
      why: "Beyond the system (node) level, parallelism also works at the process, thread, instruction and data levels.",
    },
    mc(
      "A photo app starts a brand-new process, with its own memory, for every image it resizes. What is the main drawback?",
      [
        "Spawning a process for each piece of work is expensive",
        "Processes cannot use more than one processor between them",
        "Processes always share one memory and overwrite each other",
      ],
      "Each process needs its own memory set up, so spawning individual processes to achieve parallelism is expensive.",
    ),
    {
      type: "cat",
      q: "Process-level or thread-level parallelism? Sort each description.",
      buckets: ["Process-level", "Thread-level"],
      items: [
        ["Each worker has its own memory", 0],
        ["Workers share one process's memory", 1],
        ["Costly to start a new worker", 0],
        ["Often called lightweight processes", 1],
      ],
      why: "Processes each get their own memory, so they are expensive to spawn. Threads live inside one process and share its memory: lightweight processes.",
    },
    mc(
      "Thread-level parallelism is a programming model built to make the most of what kind of hardware?",
      ["Multi-core processors", "Single-core processors", "Machines with no shared memory"],
      "Thread-level parallelism leverages multi-core processors: each thread can run on its own core.",
    ),
    mc(
      "A game studio wants one program to use all 6 cores of a laptop cheaply. Which approach suits it?",
      [
        "One process with several threads",
        "Six separate processes, one per core",
        "One thread that runs six times faster",
      ],
      "Threads inside one process share its memory, so they are cheaper to start than separate processes and can still use every core.",
    ),
    {
      type: "match",
      q: "Match each picture to the idea it stands for.",
      pairs: [
        ["Three cooks at one shared worktop", "Thread-level parallelism"],
        ["Three cooks in three separate kitchens", "Process-level parallelism"],
        ["One cook, one recipe, one bowl", "No parallelism"],
      ],
      why: "Threads share one memory (one worktop). Processes each have their own memory (their own kitchen). One cook working alone is sequential.",
    },
  ]);

  B.add("ds13-flynn", [
    {
      type: "match",
      q: "Match each architecture to its description.",
      pairs: [
        ["SISD", "One instruction stream, one data stream"],
        ["SIMD", "One instruction stream, many data streams"],
        ["MIMD", "Many instruction streams, many data streams"],
      ],
      why: "The names count the streams: S for single, M for multiple, I for instruction and D for data.",
    },
    mc(
      "A graphics chip applies the same shading instruction to 1,000 pixels at once, each pixel on its own unit. Which architecture is that?",
      ["SIMD", "MIMD", "SISD"],
      "The same instruction is executed by many processors on different data: single instruction, multiple data.",
    ),
    mc(
      "What is a uniprocessor that runs one instruction after another on one stream of data called?",
      ["SISD", "SIMD", "MIMD"],
      "A single instruction stream and a single data stream: SISD, the plain uniprocessor.",
    ),
    {
      type: "cat",
      q: "SIMD or MIMD? Sort each example.",
      buckets: ["SIMD", "MIMD"],
      items: [
        ["Four processors add 1 to their own number, in lockstep", 0],
        ["One core plays music while another checks email", 1],
        ["Every unit doubles its own value on the same command", 0],
        ["Off-the-shelf processors each run their own program", 1],
      ],
      why: "SIMD: one instruction, applied by every processor to its own data. MIMD: each processor fetches its own instructions and works on its own data.",
    },
    mc(
      "In MIMD, where does each processor get its instructions from?",
      [
        "It fetches its own instructions",
        "One shared stream sent to all of them",
        "The processor next to it in a chain",
      ],
      "In MIMD each processor fetches its own instructions and operates on its own data. A shared instruction stream would be SIMD.",
    ),
    mc(
      "In SIMD, each processor has its own data memory. Why?",
      [
        "Each works on a different data stream",
        "Each runs a different program from the others",
        "Each must keep a copy of every instruction",
      ],
      "In SIMD the same instruction runs on several processors using different data streams, so each has its own data memory: hence multiple data.",
    ),
  ]);

  B.add("ds13-threads", [
    mc(
      "Which phrase best describes a thread?",
      [
        "A stream of execution spawned by a process",
        "A separate program with its own private memory",
        "A message passed between two running programs",
      ],
      "A thread is a semi-independent stream of execution spawned by a process, which is why threads are called lightweight processes.",
    ),
    {
      type: "multi",
      q: "What do threads of the same process share? Pick all that apply.",
      o: ["Global variables", "File descriptors (open files)", "The parent process's data", "Nothing at all"],
      a: [0, 1, 2],
      why: "Threads share memory with each other, such as global variables and file descriptors, so they can see the data of the parent process.",
    },
    mc(
      "A spell-checker splits a long book into four parts and gives each part to one thread on its own core. Where does the speed-up come from?",
      [
        "The threads work on different parts of the data at once",
        "Each thread checks the whole book with fewer rules",
        "Splitting the book makes every word shorter to check",
      ],
      "Threads assigned to different physical cores operate on different parts of the data at the same time: that is the parallel speed-up.",
    ),
    mc(
      "Why does a shared memory program run on a single node?",
      ["Its cores must share one memory", "Threads cannot run on separate cores", "Each node allows only one thread"],
      "Shared memory systems require the cores to share memory, and only cores in the same machine do.",
    ),
    {
      type: "order",
      q: "Put the steps of a threaded word count in order.",
      items: [
        "The process loads the text into its memory",
        "It spawns threads, one per core",
        "Each thread counts its own part of the text",
        "The counts are combined into one total",
      ],
      why: "The data sits in the process's memory, threads are spawned onto the cores, each works on its own part, and the results are combined.",
    },
    mc(
      "Why are threads called lightweight processes?",
      [
        "They live inside a process and share its memory",
        "They run only short pieces of code each time",
        "They use less electricity than a full process",
      ],
      "A thread is spawned by a process and shares its memory, so there is far less to set up than for a whole new process.",
    ),
  ]);
})();

/* js/bank/ds-54.js: Data Science lecture 13 revision questions, part 2: ds13-openmp, ds13-messages and ds13-ranks. */
(function () {
  const B = NIC.bank;
  const { mc } = NIC.shared.ds13;

  B.add("ds13-openmp", [
    mc(
      "What is OpenMP?",
      [
        "An API for shared memory programming with threads",
        "A library for sending messages between machines",
        "A processor design with many instruction streams",
      ],
      "OpenMP is one of the most widely used APIs for shared memory programming using threads. Message passing between machines is MPI.",
    ),
    mc(
      "OpenMP's parallelism is called implicit. What does that mean?",
      [
        "Much of the parallel detail is hidden from the programmer",
        "The program runs in parallel without being compiled",
        "Every line of the program runs in parallel automatically",
      ],
      "You specify which parts to parallelise and the compiler produces the parallel executable: a lot is abstracted away from the programmer.",
    ),
    {
      type: "order",
      q: "Put one fork-join segment in order.",
      items: [
        "The master thread runs alone",
        "The master spawns worker threads",
        "The threads compute their parts separately",
        "All threads synchronise at the join",
        "The master continues alone",
      ],
      why: "Fork: the parent spawns workers, which compute separately. Join: a synchronisation point once all have finished. Then the master continues sequentially.",
    },
    mc(
      "One worker in a fork-join region is much slower than the rest. When does the master carry on past the join?",
      [
        "When the slow worker has finished too",
        "When most of the workers have finished",
        "As soon as the master's own share is done",
      ],
      "A join is a synchronisation point: computation only continues once all the threads have completed.",
    ),
    {
      type: "cat",
      q: "In a fork-join program, which parts run on the master thread alone, and which are shared out?",
      buckets: ["Master alone", "Shared by all threads"],
      items: [
        ["Reading the settings at the start", 0],
        ["The big loop between a fork and a join", 1],
        ["Printing the final report", 0],
        ["The work between a later fork and join", 1],
      ],
      why: "An OpenMP program is a sequence of fork-join parallel segments separated by lone sequential master thread segments.",
    },
    mc(
      "In OpenMP, which thread spawns the worker threads?",
      ["The parent (master) thread", "The first worker to start", "The compiler, at run time"],
      "There is one parent or master thread, which spawns the workers at each fork.",
    ),
  ]);

  B.add("ds13-messages", [
    mc(
      "In distributed memory parallelism, what can a process see?",
      ["Only its own data", "Every process's data", "Only the data of rank 0"],
      "The data is distributed amongst the processes, and each process can only see its own data.",
    ),
    {
      type: "multi",
      q: "A process wants to send a message. What must it specify? Pick all that apply.",
      o: ["The data to send", "The destination process", "The receiver's memory address", "A shared global variable"],
      a: [0, 1],
      why: "To send a message a process specifies the data to send and the destination process. The receiver's memory is invisible to it.",
    },
    mc(
      "Why are MPI messages called two-sided?",
      [
        "They need both a send and a matching receive",
        "They always travel there and back again",
        "Both processes must share the same memory",
      ],
      "A message requires a send and a receive. The operation is cooperative: sender and receiver must both play their part.",
    ),
    {
      type: "cat",
      q: "Shared memory or distributed memory? Sort each statement.",
      buckets: ["Shared memory", "Distributed memory"],
      items: [
        ["Threads read the same global variable", 0],
        ["Processes exchange explicit messages", 1],
        ["The data is split into sub-problems held by separate processes", 1],
        ["Limited to the cores of one node", 0],
      ],
      why: "Shared memory threads see the same data on one node. Distributed memory processes hold their own parts and communicate by messages.",
    },
    mc(
      "What is MPI?",
      [
        "A standard specification of a message-passing library",
        "A compiler that adds threads to a loop for you",
        "A single programming language for clusters",
      ],
      "MPI is a standard specification of a library of functions that the copies of a distributed memory program use to exchange messages. It is language-independent, with many bindings.",
    ),
    mc(
      "Process 4 posts a receive for a message from process 1. Process 3 sends to process 4. Is the message received?",
      [
        "No: the receive must match the sender's number",
        "Yes: the destination was process 4",
        "Yes, but only after process 1 also sends",
      ],
      "The receive must match the sender's process number. Process 4 expects process 1, so the message from process 3 does not match that receive.",
    ),
  ]);

  B.add("ds13-ranks", [
    mc(
      "What is the global communicator that contains every process in an MPI session called?",
      ["MPI_COMM_WORLD", "MPI_COMM_GROUP", "MPI_COMM_RANK"],
      "The main, global communicator is called World: MPI_COMM_WORLD.",
    ),
    {
      type: "match",
      q: "Match each communicator attribute to its meaning.",
      pairs: [
        ["Context", "Tells one communicator apart from another"],
        ["Group", "The set of processes it manages"],
        ["Size", "How many processes it has"],
        ["Rank", "The integer ID of each process"],
      ],
      why: "A communicator's attributes include its context (ID), its group, its size and the rank of each process.",
    },
    mc(
      "A communicator has 8 processes. What is the rank of the first one?",
      ["0", "1", "8"],
      "MPI assigns ranks starting from 0, so 8 processes have ranks 0 to 7.",
    ),
    mc(
      "Can one process belong to more than one communicator?",
      [
        "Yes, for example the world and a smaller group",
        "No, each process belongs to exactly one",
        "Only while it is sending a message",
      ],
      "A process can be associated with more than one communicator: it is always in MPI_COMM_WORLD and can also be in smaller ones.",
    ),
    {
      type: "multi",
      q: "Six processes are in MPI_COMM_WORLD, also split into two groups of three. Which statements are true? Pick all that apply.",
      o: [
        "World ranks run from 0 to 5",
        "Each group's ranks run from 0 to 2",
        "Each process has a rank in the world and one in its group",
        "The second group's ranks start at 3",
      ],
      a: [0, 1, 2],
      why: "Each communicator numbers its own processes from 0. A process in both has a world rank and a separate group rank.",
    },
    mc(
      "What does a communicator do?",
      [
        "Connects a group of processes and gives each a unique ID",
        "Copies data between threads that share one memory",
        "Turns a sequential loop into parallel threads",
      ],
      "Communicators connect groups of processes in an MPI session, give each a unique identifier (rank) and arrange them in a topology.",
    ),
  ]);
})();

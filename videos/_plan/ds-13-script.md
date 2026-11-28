# ds-13 recap video script: Thread-level parallelism

**Purpose:** show how one bakery's nightly tally gets faster by working in parallel inside one computer (threads sharing memory, OpenMP fork and join), and how separate processes with their own memory talk instead (MPI messages, communicators and ranks).

**Target length:** about 2 minutes silent (title 4 s + nine scenes, 112 s + recap 9 s = 125 s), about 4 minutes narrated.

**Running example (from the lessons):** Crumb & Co, a small bakery whose computer must tally a whole year of till receipts every night before the doors open at seven. The pile is twelve blocks of receipts, one minute each, on a four-core processor. The night shift program: load 2 minutes alone, tally 8 minutes in parallel, sort 1 minute alone, tally 4 minutes in parallel, report 1 minute alone. Later Crumb has three shops (North St, Market Sq, Station Rd), then twelve bakers in four groups.

**Source lessons:** 13.1 ds13-levels and 13.2 ds13-flynn (`js/content/ds/ds-l13-01.js`), 13.3 ds13-threads and 13.4 ds13-openmp (`ds-l13-02.js`), 13.5 ds13-messages and 13.6 ds13-ranks (`ds-l13-03.js`). Workshop 13.W "Workshop: Crumb's night shift" (`ds-l13-workshop.js`).

**Colour roles (whole video):**
- **grey**: hardware (processor cores, the node outline, "Another node"), wires, arrows, axes, plain labels.
- **blue**: threads and their parallel work (wavy thread lines, "tally" bars, worker lanes, receipt blocks being worked on).
- **purple**: processes and the master (process outlines, the master's sequential bars, instruction streams, communicators and groups).
- **orange**: memory and data (shared memory, "own memory", `total = 0`, `receipts.csv`, data streams, the message envelope).
- **green**: done and delivered (finish times, speed-ups, a matched message, a rank read correctly, ticks).
- **red**: cost and waste (expensive process start-up, idle cores, idle waiting at a join, an unmatched receive, the wall between nodes).

---

## Title card (4 s)
- Kicker: `DATA SCIENCE · LECTURE 13`
- Title: `Thread-level parallelism`
- Sub-line: `One process, many threads, every core busy`
- SPOKEN (at 0.9 s): "Lecture thirteen. Thread-level parallelism. How one computer does many pieces of work at the same time."

---

## Scene 2 · `scene-02-levels.js` · 11 s
- Kicker: `LEVELS OF PARALLELISM`
- Headline: `A mountain of receipts,` / `many places to split it`
- VISUAL: At 0.5 a tall grey pile of receipt slips with a clock "7:00" above it (a green shop-door icon, closed). A single blue worker dot ticks through the slips one by one, slowly; at 2.6 a red label "one by one: too slow". At 4.4 the pile slides left and four boxes build in a row (0.4 s apart): purple "Process" (sub "whole programs"), blue "Thread" (sub "streams inside one"), orange "Instruction" (sub "steps of one stream"), grey-green "Data" (sub "one step, many values"). At 7.6 the "Thread" box gets a thick outline and lifts slightly: "this lecture".
- CAPTIONS:
  - [0.4, 2.4] "Crumb & Co must tally a year of receipts before 7."
  - [2.6, 4.2] "One worker, one by one, is too slow."
  - [4.4, 7.4] "Parallelism works at the process, thread, instruction and data level."
  - [7.6, 10.7] "This lecture: threads inside one machine."
- SPOKEN:
  1. "Meet Crumb and Co, a little bakery. Every night, its computer must tally a whole year of till receipts before the doors open at seven."
  2. "Going through them one by one is too slow."
  3. "The fix is parallelism: doing several pieces of work at once. It can happen at the level of processes, threads, instructions or data."
  4. "This lecture is mostly about threads, the cheap way to use every core of one machine."

## Scene 3 · `scene-03-threads.js` · 13 s
- Kicker: `PROCESSES OR THREADS`
- Headline: `Separate kitchens,` / `or one kitchen with many cooks`
- VISUAL: Left half, title "Process-level", builds at 0.5: three purple boxes "Process 1/2/3", each wired down to a grey "Processor" and an orange "Memory" (sub "its own copy"). At 2.6 each new process gets a small red price tag "expensive to spawn" that pulses. Right half, title "Thread-level", builds at 5.4: one big purple outline "One process"; inside, three blue wavy thread lines "Thread 1/2/3" drawn top to bottom (0.3 s apart), each wired down to a grey "Processor" core; at 7.4 all three wires converge on one orange box "One shared memory". At 10.0 a green label under the right side "cheaper: nothing new to set up" and a small chip-icon "multi-core processor".
- CAPTIONS:
  - [0.4, 2.4] "Process-level: each process has its own memory."
  - [2.6, 5.2] "Spawning a new process every time is expensive."
  - [5.4, 7.2] "Thread-level: one process starts several threads."
  - [7.4, 9.8] "Each runs on its own core; all share one memory."
  - [10.0, 12.7] "The model built for multi-core processors."
- SPOKEN:
  1. "With process-level parallelism, each process is a separate running program, with its own processor time and its own memory."
  2. "That works, but spawning a new process for every piece of work is expensive. It is like building each baker a separate kitchen."
  3. "With thread-level parallelism, one process starts several threads."
  4. "Each thread runs on its own processor core, and they all share the process's memory. One kitchen, many cooks."
  5. "This is the programming model built for multi-core processors, the chips in nearly every laptop today."

## Scene 4 · `scene-04-flynn.js` · 14 s
- Kicker: `SISD, SIMD, MIMD`
- Headline: `Count the instruction streams,` / `then count the data streams`
- VISUAL: Three rows of a diagram, each building in turn and then shrinking up to make room for the next. Row 1 at 0.5 "SISD": one purple box "One instruction stream", a purple wire to one grey "Processor", a grey wire to one orange "Data" (sub "one stream"); a single instruction dot travels down. Row 2 at 3.6 "SIMD": one purple box "One instruction stream" with four purple wires fanning to "Processor 1..4", each over its own orange "Data 1..4"; one dot labelled "add 20% VAT" splits into four and all four processors flash at the same instant (lockstep). Row 3 at 7.8 "MIMD": four purple boxes "Instructions 1..4", one straight wire each to "Processor 1..4", each over its own orange "Data 1..4"; four dots of different shapes move down at different times. At 11.0 a grey bracket on row 3: "the cores of a multi-core processor running threads".
- CAPTIONS:
  - [0.4, 3.4] "SISD: one instruction stream, one data stream."
  - [3.6, 7.6] "SIMD: the same instruction on many processors, each with its own data."
  - [7.8, 10.8] "MIMD: each processor has its own instructions and its own data."
  - [11.0, 13.7] "Cores running separate threads work this way."
- SPOKEN:
  1. "Parallel machines are sorted by counting two kinds of stream. SISD has a single instruction stream and a single data stream: one plain processor."
  2. "SIMD means single instruction, multiple data. Here one instruction, add twenty percent VAT, runs on four processors at once, each on its own slice of prices."
  3. "MIMD means multiple instructions, multiple data. Each processor fetches its own instructions and works on its own data."
  4. "The cores of a multi-core processor, each running its own thread, work in this way."

## Scene 5 · `scene-05-shared.js` · 11 s
- Kicker: `SHARED MEMORY`
- Headline: `Threads share the worktop` / `of their process`
- VISUAL: A purple outline "Crumb's tally program (one process)". At 0.5 three wavy thread lines draw in (blue, slightly different shades) labelled "Thread 1", "Thread 2", "Thread 3": each is a stream of execution following its own path (a small dot runs down each line at its own pace). At 3.4 two orange boxes appear at the bottom of the process: "total = 0" (sub "global variable") and "receipts.csv" (sub "open file"). At 4.0 grey dashed lines draw from every thread to both boxes. At 6.4 "Thread 3" is marked "started later" (its line redraws from the top), lights up and reaches the `total` box; a green tick pops ("it can read total"). At 8.6 a grey crossed-out envelope icon: "nothing copied, nothing sent".
- CAPTIONS:
  - [0.4, 3.2] "A thread: a stream of execution spawned by a process."
  - [3.4, 6.2] "Threads share memory: global variables and open files."
  - [6.4, 8.4] "Every thread can see the parent process's data."
  - [8.6, 10.7] "Nothing has to be copied or sent first."
- SPOKEN:
  1. "A thread is a semi-independent stream of execution, spawned by a process. That is why threads are called lightweight processes."
  2. "Threads share memory, for example the global variable total, and the open receipts file."
  3. "So every thread can see the data of its parent process, even one started later."
  4. "Nothing has to be copied or sent before a thread can start work."

## Scene 6 · `scene-06-split.js` · 14 s
- Kicker: `SPLIT THE PILE`
- Headline: `Each thread takes its own part,` / `but only on one node`
- VISUAL: A row of twelve receipt blocks numbered 1 to 12 at the top; below, four grey boxes "Core 1..4". At 0.5, 1 thread: all twelve blocks turn blue and stream into Core 1 ("thread 1"); Cores 2 to 4 show red "idle"; a timer counts to "12 minutes". At 3.6, 2 threads: blocks 1 to 6 blue to Core 1, 7 to 12 a second blue shade to Core 2; Cores 3 and 4 idle; timer "6 minutes". At 6.2, 4 threads: three blocks per core, all four cores busy; timer "3 minutes" in green with "speed-up 4". At 9.4 the picture shrinks into a teal-grey outline "One node (one computer)" with an orange "Shared memory" under the cores; to the right a grey box "Another node" (sub "cannot see this memory") with a red dashed broken line between them.
- CAPTIONS:
  - [0.4, 3.4] "1 thread does all 12 blocks: 12 minutes, 3 cores idle."
  - [3.6, 6.0] "2 threads, 6 blocks each: 6 minutes."
  - [6.2, 9.2] "4 threads on 4 cores, 3 blocks each: 3 minutes."
  - [9.4, 13.7] "Threads need a shared memory, so they stay on one node."
- SPOKEN:
  1. "Here are twelve blocks of receipts, one minute each, on a four-core processor. One thread does all twelve, in twelve minutes, while three cores sit idle."
  2. "With two threads, each takes its own six blocks. Done in six minutes."
  3. "With four threads, one per core, each takes three blocks. Done in three minutes: the speed-up comes from each thread working on a different part of the data."
  4. "But threads need cores that share one memory. That means one node. A second computer cannot see this memory."

## Scene 7 · `scene-07-forkjoin.js` · 12 s
- Kicker: `OPENMP: FORK AND JOIN`
- Headline: `Mark the slow part,` / `the master calls in helpers`
- VISUAL: At 0.5 a short flow of three boxes: purple "Your program" (sub "slow loop marked"), grey "Compiler" (sub "adds the threads"), green "Parallel executable" (sub "runs on all cores"), joined by grey arrows. At 3.0 it slides up and a three-lane timeline appears below: lanes "Master", "Worker 1", "Worker 2" with a time axis 0 to 4. A green vertical line "fork" at 0; three blue "tally" bars grow from it at once: Master to 3, Worker 1 to 2, Worker 2 to 1.5. At 6.6 the short bars end and red dashed "idle" bars fill Worker 1 (2 to 3) and Worker 2 (1.5 to 3). At 8.4 a green vertical line "join" drops at 3; after it only the Master lane continues with a purple bar.
- CAPTIONS:
  - [0.4, 2.8] "OpenMP: mark what to parallelise; the compiler adds the threads."
  - [3.0, 6.4] "Fork: the master thread spawns worker threads."
  - [6.6, 8.2] "Faster threads wait for the slowest."
  - [8.4, 11.7] "Join: a sync point. Then the master carries on alone."
- SPOKEN:
  1. "OpenMP is a widely used way to program threads with shared memory. Its parallelism is implicit: you mark the slow part, and the compiler makes a parallel program."
  2. "At a fork, the master thread spawns worker threads, and each one works on its own share."
  3. "Here the two workers finish early, so they wait for the slowest."
  4. "The join is a synchronisation point. Nothing carries on until every thread has finished. Then the master continues on its own."

## Scene 8 · `scene-08-rhythm.js` · 13 s
- Kicker: `THE RHYTHM OF A PROGRAM`
- Headline: `Only the parallel parts` / `get faster`
- VISUAL: A timeline with axis 0 to 16 minutes. At 0.5, 1 thread: one "Master" lane fills left to right with five bars: purple "load" 2, blue "tally" 8, purple "sort" 1, blue "tally" 4, purple "report" 1; end label "16 minutes". At 3.8, 2 threads: lanes "Master" and "Worker 1"; green "fork" and "join" lines bracket each tally; tallies shrink to 4 and 2 on both lanes, worker shows red dashed idle during the purple parts; end "10 minutes". At 7.0, 4 threads: four lanes, tallies 2 and 1; end "7 minutes" in green. At 10.0 the three purple segments glow on all three versions with a fixed label "sequential: 4 minutes, always".
- CAPTIONS:
  - [0.4, 3.6] "1 thread: load, tally, sort, tally, report: 16 minutes."
  - [3.8, 6.8] "2 threads: each tally is forked and joined: 10 minutes."
  - [7.0, 9.8] "4 threads: 7 minutes."
  - [10.0, 12.7] "The 4 sequential minutes never shrink."
- SPOKEN:
  1. "Crumb's night shift has a rhythm. Load, tally, sort, tally again, then report. With one thread that takes sixteen minutes."
  2. "With two threads, the master forks a worker for each tally and joins it afterwards. Now it takes ten minutes."
  3. "With four threads, it takes seven minutes."
  4. "But the master's sequential parts, four minutes in all, stay the same. Only the fork and join segments get faster."

## Scene 9 · `scene-09-messages.js` · 13 s
- Kicker: `DISTRIBUTED MEMORY AND MPI`
- Headline: `No shared worktop,` / `so send messages`
- VISUAL: At 0.5 three purple outlines "Process 0", "Process 1", "Process 2", each holding an orange "Own memory" (sub "North St receipts" / "Market Sq receipts" / "Station Rd receipts") and a grey "Own processor"; red walls flash between them at 2.0 ("sees only its own data"). At 3.8 Process 1 fades back; Process 0 shows "send(total, to 2)", Process 2 shows "receive(from 0)"; an orange envelope flies along a green line from 0 to 2 and lands; green label "both sides play their part: delivered". At 7.4 replay with Process 2 showing "receive(from 1)": the envelope stops halfway on a red dashed line, red cross, label "the receive names the wrong sender: no match". At 10.2 a purple band "MPI: Message Passing Interface" slides under both processes, with grey tags "standard library spec", "language-independent".
- CAPTIONS:
  - [0.4, 3.6] "Distributed memory: each process sees only its own data."
  - [3.8, 7.2] "A message needs a send and a matching receive."
  - [7.4, 10.0] "Receive from the wrong sender: no match."
  - [10.2, 12.7] "MPI is the standard library for this."
- SPOKEN:
  1. "Crumb now has three shops, each with its own kitchen. In distributed memory, the data is split between processes, and each process can see only its own data."
  2. "To share anything, process zero sends its total to process two, and process two posts a matching receive from process zero. Messages are two-sided."
  3. "If process two waits for a message from process one instead, the message from process zero does not match, and it is not received."
  4. "MPI, the Message Passing Interface, is the standard library for this kind of message passing, with bindings for many languages."

## Scene 10 · `scene-10-ranks.js` · 11 s
- Kicker: `COMMUNICATORS AND RANKS`
- Headline: `One process,` / `a different number in each club`
- VISUAL: At 0.5 a large outline "MPI_COMM_WORLD" fills with twelve blue process cards with big numbers 0 to 11 (popping left to right); a grey counter "size 12". At 3.4 purple dashed outlines group them in threes, labelled "Group A", "Group B", "Group C", "Group D"; inside each card a small purple number appears: 0, 1, 2 in every group. At 6.4 card 7 gets a thick outline and two green name tags: "world rank 7" and "group C, rank 1". At 8.8 four small chips appear under the world: "context", "group", "size", "rank (from 0)".
- CAPTIONS:
  - [0.4, 3.2] "MPI_COMM_WORLD holds every process: ranks 0 to 11."
  - [3.4, 6.2] "Split into groups of 3: each numbers its members 0, 1, 2."
  - [6.4, 8.6] "Process 7: rank 7 in the world, rank 1 in group C."
  - [8.8, 10.7] "A communicator has a context, a group, a size and ranks."
- SPOKEN:
  1. "MPI names processes with communicators. The world communicator holds every process in the session, here twelve, ranked zero to eleven."
  2. "Split them into groups of three, and each group numbers its own members zero, one and two again."
  3. "So process seven is rank seven in the world, and rank one in group C. One process can belong to several communicators."
  4. "Every communicator knows its context, its group, its size, and the rank of each process, counted from zero."

---

## Recap card (9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; tag "Next: Workshop 13.W" at about 4.2 s.
1. **Threads share one memory on one node** · blue · pictogram: three wavy blue lines inside one purple box over an orange memory bar.
2. **Fork, work, join: only parallel parts speed up** · green · pictogram: a short timeline with a fork line, three short blue bars and a join line.
3. **Separate memories talk by MPI messages** · orange · pictogram: two purple boxes with an orange envelope on a line between them.
- SPOKEN ("at" 0.9 / 2.0 / 3.1):
  1. "Threads share their process's memory, so they split the data on one machine."
  2. "In OpenMP, the master forks workers and joins them, and only the parallel parts get faster."
  3. "Processes with their own memory exchange messages with MPI, named by their ranks. Next: Workshop thirteen W."

## Chapters
1. Levels of parallelism
2. Processes or threads
3. SISD, SIMD and MIMD
4. Threads share memory
5. Splitting the receipts
6. OpenMP: fork and join
7. Sequential parts stay the same
8. Distributed memory and MPI messages
9. Communicators and ranks

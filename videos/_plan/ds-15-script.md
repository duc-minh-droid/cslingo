# ds-15 recap video script: Lecture 15, High-performance computing

**Purpose:** in about two minutes, show how a cluster gets its power, why more processors stop paying off (Amdahl's law), and how Slurm shares the machine out.

**Target length:** 11 scenes, about 133 s silent (title 4 + content 120 + recap 9), about 4 minutes narrated.

**Sources:** js/content/ds/ds-l15-01.js (15.1 ds15-hpc, 15.2 ds15-flops), ds-l15-02.js (15.3 ds15-moore, 15.4 ds15-amdahl), ds-l15-03.js (15.5 ds15-resources, 15.6 ds15-slurm), ds-l15-workshop.js (15.W ds15-lab). Every number below is taken from those files.

**Running example:** Priya runs the weather team at the Gullhaven Sailing Club. Her storm model takes three days on her laptop, and the regatta is on Saturday, so she borrows time on the university cluster, **Kestrel**: 8 nodes, split into a **cpu** partition (6 nodes, n1 to n6) and a **gpu** partition (2 nodes, n7 and n8). Her Slurm job is **job 4021** (storm.sh).

**Colour roles (whole video):**
- **blue**: compute. Cores, nodes doing sums, the shareable part of the work, running jobs.
- **purple**: communication. The network (LAN), packets between nodes, wires.
- **orange**: I/O and waiting. Storage, the I/O chip, pending jobs in a queue (PD), the queue itself.
- **red**: limits. The part that must run in order (Amdahl), real chips lagging Moore's law, idle cores waiting for data, the electricity bill, "not 10x".
- **green**: results. Total cores, the speedup reached, the ceiling line, COMPLETED, ticks.
- **grey**: machines and frames. Laptop, node outlines, partition frames, axes, plain labels, an older job (4019).

---

## Title card (scene-01-title.js, 4 s)
- Kicker: `Data Science · Lecture 15`
- Title: `High-performance computing`
- Sub-line: `Many small workers, wired together`
- Mascot: pebble (as in ds-11).
- SPOKEN (at 0.9): "Lecture fifteen. High-performance computing. How many small workers, wired together, run one big job."

---

## Scene 2: scene-02-three-days.js (15 s)
- Kicker: `WHAT MAKES IT FAST`
- Headline: `Three days on a laptop,` / `so borrow a cluster`
- VISUAL: 0.3 a grey laptop card at left, "Priya's laptop", with a red bar growing under it labelled `storm model: 3 days` and a grey tag `regatta: Saturday`. 3.0 the laptop slides up and shrinks; three chips pop in a row (stagger 0.2): `Processing` (blue, sub `doing the sums`), `Communication` (purple, sub `moving data`), `I/O` (orange, sub `reading, writing`). 6.5 the chips fade; two compare cards: `Non-distributed` (one large grey box, sub `one big machine, shared memory`) and `Distributed` (six small blue boxes joined by purple wires, sub `many computers, one network`); the second card gets the label `Kestrel`. 9.9 the nested figure builds left to right: a frame `Cluster: many nodes` holding 4 node boxes, a zoom line to `Node: 2 processors` (two blue `CPU` boxes), a zoom line to `Processor: cores` with 8 small blue squares filling in one by one. 12.6 the counter under it types `4 nodes × 2 processors × 8 cores = 64 cores` and `64 cores` turns green.
- CAPTIONS:
  - [0.4, 2.8] "On a laptop, the storm model takes 3 days."
  - [3.0, 6.2] "Three things make a system fast: processing, communication, I/O."
  - [6.5, 9.6] "One giant machine, or many computers on a network."
  - [9.9, 12.4] "A cluster has nodes; nodes hold processors; processors hold cores."
  - [12.6, 14.7] "4 × 2 × 8 = 64 cores working at once."
- SPOKEN:
  - "Priya runs the weather team at the Gullhaven Sailing Club. On her laptop, the storm model takes three days, and the race is on Saturday."
  - "A high-performance system needs three things. Processing power does the sums, communication moves data, and I O reads and writes to storage."
  - "A supercomputer can be one huge machine, or many computers linked by a network. The university cluster, Kestrel, is the second kind."
  - "Kestrel is built in layers. It has nodes, each node holds processors, and each processor holds several cores."
  - "Four nodes, times two processors, times eight cores, gives sixty-four cores working at once."

## Scene 3: scene-03-flops.js (13 s)
- Kicker: `COUNTING SUMS`
- Headline: `Speed is counted` / `in sums per second`
- VISUAL: 0.3 three blue chips in a row: `3.14 × 2.72`, `0.5 + 1.25`, `9.81 ÷ 2.0`, each with sub `one operation`. 3.2 a green counter under them ticks up quickly, label `operations per second = FLOPS`. 5.8 the chips clear; a ladder of four rungs climbs bottom-left to top-right (one rung every 0.5 s): `gigaFLOPS (GFLOPS) 10⁹`, `teraFLOPS (TFLOPS) 10¹²`, `petaFLOPS (PFLOPS) 10¹⁵`, `exaFLOPS (EFLOPS) 10¹⁸`, with a grey `× 1000` tag between rungs. 8.9 the ladder shrinks to the left; horizontal blue bars on a log scale grow one by one: `Smartphone 200–800 G`, `Laptop 100–600 G`, `Server CPU 1–2 T`, `Consumer GPU 20–90 T`, `Data-centre GPU (H100) 1000+ T`; the last bar is longest and gets a green ring.
- CAPTIONS:
  - [0.4, 3.0] "One sum on decimal numbers is a floating-point operation."
  - [3.2, 5.6] "FLOPS: how many of them a machine does per second."
  - [5.8, 8.6] "Giga, tera, peta, exa: each rung is 1000 times the last."
  - [8.9, 12.7] "A server CPU: 1 to 2 TFLOPS. A data-centre GPU: over 1000."
- SPOKEN:
  - "A number with a decimal point, like three point one four, is a floating-point number. One sum or product on such numbers is one operation."
  - "Count how many of those a machine does in one second. That count is called FLOPS."
  - "The units climb a ladder. Giga, tera, peta, then exa, and every rung is a thousand times the one below."
  - "Phones and laptops reach hundreds of gigaFLOPS, and a server processor one to two teraFLOPS. A data-centre GPU such as the H one hundred goes past a thousand."

## Scene 4: scene-04-network.js (10 s)
- Kicker: `DON'T FORGET THE ROADS`
- Headline: `Fast nodes still wait` / `for a slow network`
- VISUAL: 0.3 four blue node cards in a row, `node 1` .. `node 4`, sub `fast cores`; 0.8 a thick purple bar draws under them with a drop line to each node, label `LAN`. 3.4 small purple packets labelled `border` hop between neighbours (1 to 2, 2 to 3, 3 to 4 and back), twice. 6.5 the LAN bar turns thin and dashed, label changes to `slow LAN`; packets now crawl; on each node card a red dashed bar `waiting` grows while the blue `computing` bar stops.
- CAPTIONS:
  - [0.4, 3.2] "Nodes are joined by a LAN, a local-area network."
  - [3.4, 6.2] "Each step, every node swaps border weather with its neighbours."
  - [6.5, 9.6] "A slow network leaves fast cores waiting for data."
- SPOKEN:
  - "Inside one building, Kestrel's nodes are joined by a local area network, a LAN."
  - "At every step of the storm model, each node swaps the weather at its border with its neighbours."
  - "If that network is slow, the fast cores finish their sums and then sit waiting for data."

## Scene 5: scene-05-moore.js (13 s)
- Kicker: `MOORE'S LAW`
- Headline: `Twice the transistors,` / `about every two years`
- VISUAL: 0.3 five grey chip squares in a row labelled `year 0`, `year 2`, `year 4`, `year 6`, `year 8`; 0.8-3.4 they fill with small blue squares, one chip at a time: 1, 2, 4, 8, 16, with `1×`, `2×`, `4×`, `8×`, `16×` under them. 3.6 a green tag `year 10: 32×` pops at the right. 6.1 the chips shrink to the top; a chart draws below: grey axes `years` and `transistors (doublings)`, a dashed blue straight line `Moore's law`, then a solid red line `real chips` that follows it, then bends below it in the later years. 9.3 the chart fades; three chips: `1 core` (red, sub `can't get much faster`), arrow, `many cores` (blue, sub `share the work`), arrow, `many nodes` (blue, sub `a whole cluster`).
- CAPTIONS:
  - [0.4, 3.4] "Moore's law: transistors on a chip double about every two years."
  - [3.6, 5.8] "1, 2, 4, 8, 16. Ten years: 32 times as many."
  - [6.1, 9.0] "Now chips are hitting limits and falling behind."
  - [9.3, 12.6] "So new speed comes from more cores and more nodes."
- SPOKEN:
  - "Moore's law says the number of transistors on a chip doubles about every two years. Transistors are the tiny switches a chip is built from."
  - "One, two, four, eight, sixteen. After ten years, a chip holds thirty-two times as many."
  - "Now the industry is hitting its limits. Real chips are falling behind the doubling line."
  - "When one core stops getting faster, we add workers. Extra speed now comes from more cores and more nodes."

## Scene 6: scene-06-amdahl.js (14 s)
- Kicker: `AMDAHL'S LAW`
- Headline: `The part that must run` / `in order stays put`
- VISUAL: the slide's example as two time bars. 0.3 a red block `10 sums in order` and a blue block `100 sums, shareable` appear side by side, legend `must run in order` (red) / `can be shared out` (blue). 3.4 they join into the top bar `1 processor`, with an end tag `110 sums`. 6.0 a second bar `10 processors` draws: the red block copies down at full width, then the blue block shrinks to a tenth (10 sums wide) in 1 s, while ten thin blue strips fan out above it and merge (the split). 9.4 end tag `20 sums`; a green tag `speedup 110 ÷ 20 = 5.5×` and a red tag `not 10×` beside it. 11.8 the red block in both bars pulses.
- CAPTIONS:
  - [0.4, 3.2] "10 sums must run in order. 100 more can be shared."
  - [3.4, 5.8] "On 1 processor: 110 sums in a row."
  - [6.0, 9.2] "On 10 processors the 100 split ten ways. The 10 do not."
  - [9.4, 11.6] "Time of 20 sums: a speedup of 5.5, not 10."
  - [11.8, 13.7] "The sequential part sets the limit."
- SPOKEN:
  - "The slides take a small job. Ten single sums must happen one after another, then a hundred more sums can be shared out."
  - "On one processor, that is a hundred and ten sums in a row."
  - "Now use ten processors. The hundred sums are split ten ways, but the ten single sums still go one by one."
  - "The job now takes the time of twenty sums. That is a speedup of five and a half, not ten."
  - "This is Amdahl's law. The part that cannot be parallelised sets the limit."

## Scene 7: scene-07-ceiling.js (13 s)
- Kicker: `THE CEILING`
- Headline: `More processors help,` / `up to a limit`
- VISUAL: 0.3 the formula at the top: `S = 1 / ((1 − p) + p / s)`, with `p` underlined blue (`share that can be shared`) and `s` underlined blue (`speedup of that part`). 3.4 below it a chart: x axis `processors` 1 to 64, y axis `speedup` 0 to 10. The 90% curve draws in blue from 1 to 64; dots with tags at 8 (`4.7×`) and at 64 (`8.8×`). 6.6 a green dashed ceiling line at 10, tag `best possible: 1 ÷ 0.1 = 10×`; a small red block (the 10% in order) sits at the left of the chart. 9.2 a second curve, `50% shareable`, draws in red: it flattens almost at once; its own green dashed ceiling at 2, dot at 32 with tag `1.9×`.
- CAPTIONS:
  - [0.4, 3.2] "p: the share of time that can be shared. s: its speedup."
  - [3.4, 6.4] "90% shareable: 8 processors give 4.7×, 64 give 8.8×."
  - [6.6, 9.0] "It can never beat 1 ÷ 0.1 = 10×."
  - [9.2, 12.6] "50% shareable: even 32 processors stay below 2×."
- SPOKEN:
  - "Amdahl's law uses two numbers. p is the share of the run time that can be shared out, and s is how much faster that part gets."
  - "With ninety per cent shareable, eight processors give a speedup of four point seven, and sixty-four give eight point eight."
  - "However many you add, the ten per cent in order stays. The speedup can never beat ten."
  - "With only half the work shareable, even thirty-two processors stay below two. Shrink the part that won't share before asking for more."

## Scene 8: scene-08-resources.js (13 s)
- Kicker: `WHO GETS THE MACHINE`
- Headline: `A costly machine` / `must never sit idle`
- VISUAL: 0.3 four chips in a row: `Admins` (sub `dedicated staff`), `Support` (sub `contracts, repairs`), `Power`, `Cooling`, all grey with a red tag above `electricity: up to $800M a year`. 3.4 they slide away; a grey desk card `Resource manager` with three blue steps in a flow: `Resource allocation` (`which hardware`), `Workload scheduling` (`who runs when`), `Execution and monitoring` (`start it, watch it`); the first two light at 3.6 and 4.6, the third at 6.8 while three small node boxes start blinking blue. 9.6 the flow lifts; a queue: three orange cards `job 3`, `job 2`, `job 1` (sub `pending`), an arrow `next`, and a blue box `Cluster` (sub `runs job 0`); at 11.0 job 0 turns green (done), job 1 slides into the cluster (blue), the others move up one place.
- CAPTIONS:
  - [0.4, 3.2] "Owning it costs admins, support, power and cooling."
  - [3.4, 6.6] "A resource manager allocates hardware and schedules the work."
  - [6.8, 9.4] "It starts the work on many nodes and monitors it."
  - [9.6, 12.6] "Each job waits in a queue that sets the order."
- SPOKEN:
  - "A supercomputer costs more than its price. There are administrators, support contracts, and the electricity to power and cool it, up to eight hundred million dollars a year."
  - "So software shares it out. A resource manager decides who gets which hardware, and who runs when."
  - "It also starts the work on many nodes, and keeps an eye on it while it runs."
  - "Work comes as jobs, each with its own input data. Pending jobs wait in a queue, and the queue sets the order."

## Scene 9: scene-09-partitions.js (13 s)
- Kicker: `SLURM`
- Headline: `Partitions are queues,` / `most important first`
- VISUAL: 0.3 a grey `Slurm` badge at the top with four small tags `open-source`, `modular`, `extensible`, `scalable`. 3.2 eight grey node boxes `n1` .. `n8`, all `free`; a dashed grey frame around n1-n6 labelled `partition cpu`, another around n7-n8 labelled `partition gpu`. 6.4 three job cards wait at the left: `high` (4 nodes), `mid` (2 nodes), `low` (2 nodes). The `high` card flies into n1-n4, which turn blue `high`; then `mid` flies into n5-n6, which turn blue `mid`. 9.6 the `low` card moves towards the cpu frame, bounces off, turns orange with tag `PD: waiting for free nodes`.
- CAPTIONS:
  - [0.4, 3.0] "Slurm: Kestrel's resource manager and scheduler."
  - [3.2, 6.2] "Partitions: cpu has 6 nodes, gpu has 2. Each is a queue."
  - [6.4, 9.4] "The high-priority job takes 4 nodes, the next takes 2."
  - [9.6, 12.6] "No nodes left: the third job waits."
- SPOKEN:
  - "Kestrel's booking desk is called Slurm. It is open source, modular, extensible and scalable."
  - "Slurm splits the nodes into partitions. The cpu partition has six ordinary nodes, and the gpu partition two with accelerators. Each one is a job queue."
  - "Free nodes go to the highest priority job first. It takes four nodes, and the next job takes the last two."
  - "The pool is empty now, so the third job waits in the queue."

## Scene 10: scene-10-commands.js (15 s)
- Kicker: `FOUR COMMANDS`
- Headline: `Submit, check,` / `run, read the record`
- VISUAL: left half, a dark terminal panel that types its lines; right half, the cpu partition n1-n6 (as in scene 9) and a status tag for `Job 4021`. 0.4 types `$ sbatch storm.sh` then `Submitted batch job 4021`; n1-n3 are grey `job 4019`; status tag orange `PENDING`. 3.6 types `$ squeue -u priya` and the table `JOBID PARTITION NAME ST NODES` / `4021 cpu storm PD 4` (the `PD` orange). 5.6 n1-n3 clear (4019 finishes), then n1-n4 turn blue `4021`; status tag blue `RUNNING`. 7.6 types `$ srun -n 4 ./storm_model` and `step 4021.0: 4 tasks on n1-n4 ... done`; the four nodes relabel `task 0` .. `task 3` and pulse together. 11.0 types `$ sacct -j 4021` and `4021 COMPLETED 05:12:40 4`; nodes clear; status tag green `COMPLETED` with a tick.
- CAPTIONS:
  - [0.4, 3.4] "sbatch submits job 4021. Nodes are busy, so it waits."
  - [3.6, 7.3] "squeue shows it pending, PD. Then it gets n1 to n4."
  - [7.6, 10.7] "srun launches a job step: 4 tasks, one per node."
  - [11.0, 14.6] "sacct shows the record: completed in 5 h 12 min."
- SPOKEN:
  - "Priya submits her storm job with sbatch. It becomes job four zero two one, and waits, because three nodes are busy with an older job."
  - "She checks it with squeue, which shows it pending. When the older job finishes, Slurm gives it four nodes, n one to n four."
  - "Inside that allocation, srun launches a job step of four parallel tasks, one on each node."
  - "Afterwards, sacct shows the record. The job completed, after about five hours and twelve minutes."

---

## Recap card (scene-11-recap.js, 9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; CTA sticker `Next: Workshop 15.W`.
1. Head `Power = nodes × processors × cores,` / `counted in FLOPS`; tone **blue**; pictogram: one grey node box splits into two blue processor boxes, then each fills with small blue core squares; a green `64` pops beside it.
2. Head `Amdahl: the part that won't share` / `sets the ceiling`; tone **red**; pictogram: two small bars, red block plus blue block; in the lower bar the blue block shrinks while the red stays; a green dashed ceiling line appears above.
3. Head `Slurm: partitions, priority,` / `sbatch, squeue, srun, sacct`; tone **orange**; pictogram: three small orange job chips in a queue; the first slides into a grey node frame, turns blue, then green with a tick.
- SPOKEN (at 0.9 / 2.0 / 3.1):
  - "A cluster's power comes from nodes, processors and cores, and it is counted in floating-point operations per second."
  - "Amdahl's law says the part that must run in order caps the speedup, however many processors you add."
  - "Slurm shares the machine. Jobs wait in partitions, the highest priority goes first, and four commands take a job from submit to record."

---

## Chapters
1. What makes a system fast (scene 2)
2. FLOPS and the ladder (scene 3)
3. The network matters (scene 4)
4. Moore's law and its limits (scene 5)
5. Amdahl's law (scene 6)
6. The speedup ceiling (scene 7)
7. Resource managers and queues (scene 8)
8. Slurm partitions and priority (scene 9)
9. Four Slurm commands (scene 10)

Not covered (left to the lessons and Workshop 15.W): the resource types list (nodes, cores, interconnect, storage, accelerators), monolithic against stepped and interactive against batch jobs, the workshop's storm / plots / train queue and the train job's GPU fix.

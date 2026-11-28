# ds-16 recap video script: Lecture 16, Hardware–software co-design

**Purpose:** in about two minutes, show why AI pushes chips and code to be designed for each other, the ways that design can flow, and how to split, profile and measure a real pipeline.

**Target length:** 11 scenes, about 134 s silent (title 4 + content 121 + recap 9), about 4 minutes narrated.

**Sources:** js/content/ds/ds-l16-01.js (the Leafly pipeline model `plan()`, the flows and partition demos), ds-l16-02.js (16.1 ds16-why, 16.2 ds16-ai, 16.3 ds16-flows), ds-l16-03.js (16.4 ds16-partition, 16.5 ds16-workload, 16.6 ds16-stack), ds-l16-workshop.js (16.W ds16-lab). Every number below comes from those files.

**Running example:** **Leafly**, a phone app that names a plant from a photo ("that's ivy"). Today the photo goes to the cloud; the team wants it instant and offline. One photo has three stages, with these times from `STAGES` in ds-l16-01.js: Prepare photo (CPU 8 ms), Run network (CPU 120 ms, GPU 15 ms), Show result (CPU 4 ms). Each change of processor adds a copy: 12 ms for the prepared image going over, 1 ms for the answer coming back (`COPY` = [20, 12, 1]).
- All on CPU: 8 + 120 + 4 = **132 ms**, no copying.
- Network on GPU: 8 + 12 + 15 + 1 + 4 = **40 ms**, **13 ms** of it copying.
- GPU twice as fast: 15 becomes 7.5, total **32.5 ms**.
- Photo four times as big (GPU normal speed): copies 48 + 4 = **52 ms**, total **79 ms**.

**Colour roles (whole video):**
- **blue**: the CPU and software (code, models, libraries, the framework).
- **purple**: the GPU and hardware (chips, silicon, the compiler that picks chip operations).
- **green**: the specialised chip (plant chip, ADAS chip, DPU) and wins (a tidy partition, a met target, the co-design loop).
- **orange**: data on the move and demand: copies between processors, the photo travelling to the cloud, the "Demand" box of the loop.
- **red**: problems: the slow answer, no signal, the stage that dominates the time, a rule frozen in silicon, a bottleneck.
- **grey**: frames, phone and server outlines, axes, plain labels.

---

## Title card (scene-01-title.js, 4 s)
- Kicker: `Data Science · Lecture 16`
- Title: `Hardware–software co-design`
- Sub-line: `Make the chip and the code for each other`
- Mascot: pebble (as in ds-11).
- SPOKEN (at 0.9): "Lecture sixteen. Hardware software co-design. How chips and code are made for each other."

---

## Scene 2: scene-02-leafly.js (14 s)
- Kicker: `WHY CO-DESIGN`
- Headline: `One chip can't do it all` / `for every job`
- VISUAL: 0.3 a grey phone outline at left with a leaf photo; a flow beside it builds: `Snap` (sub `a photo of a leaf`) → `Recognise` (sub `a neural network`) → `Answer` (sub `"that's ivy"`). 2.8 the flow fades; an orange photo packet flies from the phone up to a grey cloud server, waits, and a red tag `a few seconds` appears; then the signal bars on the phone cross out red, tag `no signal: no answer`. 5.8 two cards: `General chip` (grey, a Swiss army knife pictogram, sub `does almost anything`) and `Specialised chip` (green, a garlic press pictogram, sub `one job, far better`); a red arrow labelled `AI and data science` presses against the general card. 8.8 a red tag `Moore's law: slowing down` slides in under them. 11.4 a purple chip card `new chip: very expensive`, and an orange tag `needs large demand` locks onto it with a green tick.
- CAPTIONS:
  - [0.4, 2.6] "Leafly: snap a leaf, get the plant's name."
  - [2.8, 5.6] "Today the photo goes to the cloud. Answer: a few seconds."
  - [5.8, 8.6] "AI pushes general hardware to its limits."
  - [8.8, 11.2] "Moore's law is slowing: waiting won't do it."
  - [11.4, 13.7] "A new chip is very expensive, so it needs large demand."
- SPOKEN:
  - "Meet Leafly, a phone app. Snap a photo of a plant, and it tells you its name."
  - "Today the photo goes off to a big server. The answer takes a few seconds, and with no signal there is no answer at all."
  - "Specialised work like AI is pushing general hardware to its limits. A Swiss army knife does everything, but a garlic press does one job far better."
  - "And chips no longer get much faster on their own. Moore's law is slowing down."
  - "Designing a new chip is extremely expensive. So it only makes sense when there is a large demand, and AI has that."

## Scene 3: scene-03-codesign.js (11 s)
- Kicker: `CO-DESIGN`
- Headline: `Hardware and software,` / `made for each other`
- VISUAL: 0.3 two cards: `Hardware` (purple, chip pictogram, sub `a chip`) on the left and `Software` (blue, sub `an algorithm, an ML model, a library`) on the right. 0.8 a purple arrow from Software to Hardware, label `hardware shaped by the software`. 3.6 a blue arrow back from Hardware to Software, label `software tuned to the hardware`; a small grey tag `sometimes before the chip exists`. 6.8 the two arrows bend into a closed loop, which turns green; a green label in the middle `co-design`.
- CAPTIONS:
  - [0.4, 3.4] "Hardware designed around the software it will run."
  - [3.6, 6.6] "Software tuned to make full use of that hardware."
  - [6.8, 10.6] "Both shaped by each other: hardware–software co-design."
- SPOKEN:
  - "The first half is hardware. A chip is designed around the software it will run, such as an algorithm or a machine learning model."
  - "The second half is software. A library or a model is tuned to make full use of that chip, sometimes before the chip even exists."
  - "Each is shaped by the other, like a tailor and a dancer. That is called hardware software co-design."

## Scene 4: scene-04-tensors-edge.js (13 s)
- Kicker: `WHAT AI ASKS`
- Headline: `Full grids, empty grids,` / `and the move to the edge`
- VISUAL: 0.3 a grey label `tensor operations` above two 6 × 6 grids. 3.2 left grid fills every cell blue, row by row, label `dense: images (CNNs)`; right grid fills only 5 scattered cells, label `sparse: recommendations`. 6.0 the grids slide away; a grey cloud at the top, the phone at the bottom; an orange photo packet goes up, a purple `network` block sits in the cloud, an answer comes back down. 9.0 the purple network block slides down into the phone, the cloud greys out, and a green tag `on the device: edge computing` appears under the phone.
- CAPTIONS:
  - [0.4, 3.0] "AI models run on tensor operations."
  - [3.2, 5.8] "Images: dense tensors. Recommendations: sparse ones."
  - [6.0, 8.8] "AI usually runs in the cloud."
  - [9.0, 12.6] "Personal models move it onto the phone: edge computing."
- SPOKEN:
  - "AI models are built from tensor operations, big grids of numbers."
  - "A photo is a full grid, so image models such as C N Ns use dense tensors. Recommendations are mostly empty, so they use sparse ones. Each needs different hardware."
  - "Today, most AI runs in the cloud, far away from the user."
  - "As models become more personal, the work moves onto the device itself. That is edge computing, and it needs small, frugal chips."

## Scene 5: scene-05-cars-datacentres.js (12 s)
- Kicker: `BEYOND AI`
- Headline: `New chips in cars` / `and data centres`
- VISUAL: top half: 0.3 a flow `Cameras` (grey, sub `and radar`) → `ADAS chip` (green, sub `specialised`) → `Brake` (sub `in milliseconds`), with small grey tags under it `lane keeping`, `emergency braking`, `parking help`. Bottom half: 3.6 a blue card `Server CPU` holding three chips `Networking`, `Storage`, `Security`; beside it a green card `DPU / IPU` with grey names `NVIDIA BlueField`, `AMD Pensando`, `Intel IPU`. 7.6 the three chips slide one by one (stagger 0.4) from the CPU card into the DPU card; the CPU card then shows `customer apps`.
- CAPTIONS:
  - [0.4, 3.4] "Cars: ADAS chips see the road and brake in milliseconds."
  - [3.6, 7.4] "Data centres: DPUs and IPUs sit beside the CPU."
  - [7.6, 11.6] "They take networking, storage and security off its hands."
- SPOKEN:
  - "The same trend reaches beyond AI. In cars, driver assistance chips turn camera images into braking, in a few milliseconds, every time."
  - "In data centres, infrastructure processors sit beside the server's CPU. They are called D P Us and I P Us."
  - "They take the chores. Networking, storage and security move off the CPU, so it can run the customer's own work."

## Scene 6: scene-06-flows.js (15 s)
- Kicker: `FOUR FLOWS`
- Headline: `Chip first, code first,` / `or both at once`
- VISUAL: three rows, each a purple `Hardware` box and a blue `Software` box with an arrow drawn between them, plus a grey example tag at the right.
  - 0.4 row 1 `Bottom-up`: Hardware → Software; tag `early GPU computing`.
  - 3.8 row 2 `Top-down`: Software → Hardware; tag `Volta tensor cores`.
  - 7.2 row 3 `Co-design`: arrows both ways, pulsing in turn; tag `Snapdragon Ride Flex, Ride Vision`.
  - 10.6 the rows shrink up; a loop of three boxes draws below: `Demand` (orange) → `Software` (blue) → `Hardware` (purple) → back to Demand; a dot runs round the loop twice; label `iterative`.
- CAPTIONS:
  - [0.4, 3.5] "Bottom-up: hardware first, software later. Early GPU computing."
  - [3.8, 6.9] "Top-down: the workload drives the chip. Volta tensor cores."
  - [7.2, 10.3] "Co-design: both together. Snapdragon Ride Flex and Ride Vision."
  - [10.6, 14.6] "Demand, software, hardware, round again: an iterative loop."
- SPOKEN:
  - "In bottom-up design, the hardware comes first, and software is written for it later. Early general purpose GPU computing worked like that."
  - "In top-down design, the software workload drives a new chip. NVIDIA's Volta tensor cores were built for the tensor operations of AI."
  - "In co-design, both are designed, analysed and optimised together. Qualcomm's Snapdragon Ride Flex and Ride Vision for cars are an example."
  - "Neither flow is always better. Demand calls for new software, software drives new hardware, and the loop goes round again."

## Scene 7: scene-07-partition.js (15 s)
- Kicker: `PARTITIONING`
- Headline: `Fast and fixed,` / `or flexible and slower`
- VISUAL: 0.3 two columns: `software` (blue frame, left) and `hardware` (purple frame, right). Six job cards sit in software: `Recognise the plant (the network)`, `Decode the camera stream`, `Encrypt photo uploads`, `Menus and settings`, `Plant-care tips`, `Pet-safety rules`. Two counters under the columns: `Speed 0/3 fast`, `Easy to update 3/3 free`. 2.8 the first three cards slide to hardware (stagger 0.4); the speed counter climbs to `3/3 fast` and turns green. 5.0 `Pet-safety rules` slides to hardware and turns red, tag `new rule next month: new chip`, update counter drops to `2/3`; at 7.0 it slides back and the counter returns to `3/3`. 8.0 the board shrinks to the top; a chain draws: `HDL model` (purple, sub `of the chip`) + `Software` (blue, sub `the real code`) → `Simulate` (green, sub `together`). 11.0 a second chain: `What it does` (blue, sub `high-level spec`) → `Synthesis` (sub `automated`) → `HDL design` (purple); 13.0 a small grey tag `Platform-based design: start from a kit`.
- CAPTIONS:
  - [0.4, 2.6] "Six Leafly jobs. Which go into hardware?"
  - [2.8, 4.8] "Heavy, stable jobs to hardware: speed and parallelism."
  - [5.0, 7.6] "Rules that change stay in software, easy to update."
  - [8.0, 10.8] "Simulate chip and code together before building anything."
  - [11.0, 14.6] "High-level synthesis: describe the behaviour, get an HDL design."
- SPOKEN:
  - "Partitioning decides which jobs go to hardware and which stay in software. Leafly has six of them."
  - "The network, the camera stream and encryption are heavy and stable. In hardware they get speed and parallelism."
  - "Pet safety rules change whenever a vet finds a new poisonous plant. In silicon they would need a new chip, so they stay in software."
  - "Before anything is built, engineers describe the chip in a hardware description language, and simulate it together with the real code."
  - "With high level synthesis, they write what the system should do, and a tool turns it into a hardware design. Or they start from a ready-made platform."

## Scene 8: scene-08-profile.js (15 s)
- Kicker: `FOLLOW THE TIME`
- Headline: `Profile first,` / `then watch the copies`
- VISUAL: a timeline of one photo, lanes `CPU` (blue), `GPU` (purple), `Copying` (orange), axis `time for one photo (ms)` 0 to 140. 0.4 the all-CPU bars grow in turn: `Prepare` 8, `Run network` 120, `Show` 4; total tag `132 ms`. 2.8 the network bar turns red and pulses, tag `120 of 132 ms`. 5.0 the network bar lifts into the GPU lane and shrinks to 15; orange copy bars appear before it (12) and after it (1); the bars re-pack; total tag `40 ms`, orange tag `13 ms copying`. 9.0 the GPU bar halves to 7.5, the copies stay; total `32.5 ms`. 11.4 the GPU bar returns to 15; a tag `photo 4×`; the copy bars stretch to 48 and 4 and turn red at the edges; total `79 ms`, orange tag `52 ms copying`.
- CAPTIONS:
  - [0.4, 2.6] "One photo on the phone's CPU: 132 ms."
  - [2.8, 4.8] "The network takes 120 of them."
  - [5.0, 8.8] "Network on the GPU: 40 ms, but 13 ms of it is copying."
  - [9.0, 11.2] "A GPU twice as fast: only 32.5 ms."
  - [11.4, 14.6] "A photo 4 times as big: copies take 52 ms."
- SPOKEN:
  - "First, profile on realistic inputs. On the phone's CPU, one photo takes a hundred and thirty-two milliseconds."
  - "The network alone takes a hundred and twenty of them. That is the part to look at first."
  - "Move the network to the GPU, and the photo takes forty milliseconds. But thirteen of those are spent copying data across and back."
  - "Make the GPU twice as fast, and only the network bar shrinks. The total is thirty-two and a half."
  - "Now copy a photo four times as big. The copies take fifty-two milliseconds, more than all the computing. Moving data can cost more than computing on it."

## Scene 9: scene-09-chips-stack.js (13 s)
- Kicker: `RIGHT JOB, RIGHT CHIP`
- Headline: `Match the work to the chip,` / `let the stack translate`
- VISUAL: 0.3 three cards pop (stagger 0.4): `CPU` (blue, sub `varied tasks, control flow`), `GPU` (purple, sub `similar maths in parallel`), `Specialised chip` (green, sub `frequent, stable operations`). 4.8 the cards shrink to the top; a relay below: `CPU: prepare` → orange `copy` → `GPU: network` → orange `copy` → `CPU: show`; a baton dot runs along it; tag `40 ms instead of 132`. 8.4 the relay fades; a three-layer stack draws from the top: `Framework` (blue, sub `expresses the model`), `Compiler` (purple, sub `picks chip operations`), `Runtime` (green, sub `schedules work and memory`), with arrows down to a small purple chip at the bottom.
- CAPTIONS:
  - [0.4, 4.6] "CPU: varied tasks. GPU: maths in parallel. Specialised: stable work."
  - [4.8, 8.2] "CPU prepares, GPU runs the network, CPU shows the answer."
  - [8.4, 12.6] "Framework, compiler, runtime: the stack maps the model to the chip."
- SPOKEN:
  - "Each processor suits its own kind of work. A CPU handles varied tasks and control flow, a GPU runs similar maths in parallel, and a specialised chip runs frequent, stable operations."
  - "In image classification the photo is passed on like a baton. The CPU prepares it, the GPU runs the network, and the CPU shows the result."
  - "A software stack maps the model onto the chip. The framework expresses the model, the compiler picks the chip's own operations, and the runtime schedules the work and memory."

## Scene 10: scene-10-measure.js (13 s)
- Kicker: `MEASURE AND REPEAT`
- Headline: `Measure the whole pipeline,` / `then go round again`
- VISUAL: 0.3 four meter chips pop: `Latency` (one answer), `Throughput` (answers per second), `Energy per result`, `Cost` (hardware and development). 3.6 a loop of three boxes draws: `Prototype` (blue) → `Measure all` (orange) → `Re-partition` (purple) → back. 7.0 beside it, a mini timeline: the network bar shrinks to a quarter, and the orange copy bar is left as the longest; it turns red with tag `the bottleneck moved`. 9.8 everything shrinks; four green tags pop: `power`, `performance`, `cost`, `development time`; under them grey tags `embedded`, `consumer electronics`, `cars`, `5G`.
- CAPTIONS:
  - [0.4, 3.4] "Measure latency, throughput, energy per result and cost."
  - [3.6, 6.8] "Prototype, measure end to end, revisit the partition."
  - [7.0, 9.6] "Speed one part up and the bottleneck moves."
  - [9.8, 12.6] "Co-design trades power, performance, cost and time."
- SPOKEN:
  - "Then measure. End to end latency, throughput, energy per result, and the cost of hardware and development."
  - "Prototype before committing to new hardware, measure the complete pipeline, and revisit the partition."
  - "When one part speeds up, the bottleneck moves, often to copying data. Measuring the whole pipeline shows where it went."
  - "Co-design opens a wider space of trade-offs between power, performance, cost and development time. It matters most in embedded systems, consumer electronics, cars and five G."

---

## Recap card (scene-11-recap.js, 9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; CTA sticker `Next: Workshop 16.W`.
1. Head `Co-design: hardware and software` / `shaped for each other`; tone **purple**; pictogram: a purple chip box and a blue code box; a purple arrow goes one way, a blue arrow comes back, and the pair closes into a green loop.
2. Head `Partition: heavy, stable jobs in hardware,` / `changing ones in software`; tone **blue**; pictogram: six small chips in a blue column; three slide right into a purple column; one of the others tries, flashes red and slides back.
3. Head `Profile, count the copies,` / `measure the whole pipeline`; tone **orange**; pictogram: a mini timeline with a long blue bar that moves to a short purple bar, leaving two orange copy bars that pulse.
- SPOKEN (at 0.9 / 2.0 / 3.1):
  - "In co-design, the chip is shaped by the software, and the software is tuned to the chip."
  - "Heavy, stable jobs go into hardware for speed. Anything that changes stays in software."
  - "Profile first, watch the cost of moving data, and measure the whole pipeline before going round again."

---

## Chapters
1. Why one chip can't do it all (scene 2)
2. What co-design means (scene 3)
3. Dense, sparse and the edge (scene 4)
4. Chips for cars and data centres (scene 5)
5. Bottom-up, top-down, co-design (scene 6)
6. Partitioning and design tools (scene 7)
7. Profile and the cost of copies (scene 8)
8. The right chip and the software stack (scene 9)
9. Measure and iterate (scene 10)

Not covered (left to the lessons and Workshop 16.W): the plant chip's numbers (network 10 ms, 35 ms and 27.4 mJ per photo against the 40 ms and 30 mJ budget), energy per processor, preparing the photo on the GPU (46 ms, 20 ms copy), and the "Expensive, so it needs demand" flow detail beyond scene 2.

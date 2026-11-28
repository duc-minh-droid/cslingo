# Lecture 18 recap video script: Neuromorphic computing

**Purpose:** show what makes a neuromorphic computer different from a von Neumann one, its four strengths, what it is good for, the real machines, why it is not mainstream yet, the event camera, and how spiking units could run metaheuristics.

**Target length:** about 2 minutes silent (title 4 s + 9 content scenes, 113 s + recap 9 s = 126 s), about 4 minutes narrated.

**Running example:** Priya's Hoglet, a little camera that watches her garden for hedgehogs all night, whose battery dies by Tuesday.

**Sources:** js/content/nic/l18-01.js (figures and demos: `shuttleFig`, `spikeFig`, `netFig`, `eventDemo`, `cameraDemo`, `unitsDemo`), l18-02.js (18.1 to 18.3), l18-03.js (18.4 to 18.6), l18-workshop.js (18.W). Demo numbers below come from that kernel (event demo: 24 moments, seed 7; camera: a 12 by 6 pixel picture, hedgehog 2 pixels wide; units demo: seed 11, five units, target setting 7.2) and should be recomputed and asserted at load in `videos/l18/common.js`.

**Colour roles (this video):**
- **orange** = the conventional side: von Neumann chip, clocked chip, frame camera (amber in the lessons).
- **green** = the neuromorphic side: synapses that store and compute, event-driven chip, event camera, the best setting found.
- **purple** = spikes (spike ticks, a unit that spikes).
- **blue** = data and big machines: memory, the routed path, TrueNorth, deep learning's side.
- **red** = problems and costs: wasted trips, hard access, long training, no benchmarks.
- **grey** = neutral: idle cells, quiet pixels, axes.

**Layout convention:** stage 1080 x 1080, content area x 12..924 under the headline. Main figure on the left (about 600 px), right panel x 636..924 for stat tiles (label above, big number below). Comparison scenes use two cards side by side (x 12..462 and x 474..924). Text at least 28 px.

---

## Scene 1: Title card (`scene-01-title.js`, 4 s)
- **Kicker:** Nature-Inspired · Lecture 18
- **Title:** Neuromorphic computing
- **Sub-line:** Computers built like brains, that work only when a spike arrives
- **Spoken (at 0.9):** "Lecture eighteen. Neuromorphic computing. This is how a chip can be shaped like a brain, and spend energy only when something happens."

---

## Scene 2: `scene-02-vonneumann.js`, 12 s
- **Kicker:** A COMPUTER SHAPED LIKE A BRAIN
- **Headline:** "Hoglet's chip" / "keeps making trips"
- **VISUAL:** 0.4 s: Hoglet (a small camera on a post) in a dark garden at the left; a battery icon with "dies by Tuesday". 3.2 s: inside Hoglet, two boxes: "Processor" (orange) on the left and "Memory" (blue) on the right, a "Program" scroll above the processor with steps "1, 2, 3". 6.0 s: binary packets "0110", "1011" shuttle back and forth between the boxes along a bus, faster and faster; each trip ticks a red counter "trips" in the right panel and takes a sliver off the battery. 8.8 s: label over the bus: "every trip costs time and energy". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Hoglet watches the garden for hedgehogs all night."
  - [3.2, 5.8] "Inside: a von Neumann computer, processor and memory apart."
  - [6.0, 8.6] "A program runs step by step, in binary."
  - [8.8, 11.7] "Data shuttles back and forth, and every trip costs energy."
- **SPOKEN:**
  - "Priya has built Hoglet, a little camera that watches her garden for hedgehogs all night. Its battery dies by Tuesday."
  - "Inside is an ordinary von Neumann computer. A processor does the sums, and a separate memory stores the data."
  - "A program tells it what to do, one step at a time, and everything is coded in binary."
  - "So data shuttles between processor and memory all night, and every trip costs time and energy."

## Scene 3: `scene-03-neuromorphic.js`, 13 s
- **Kicker:** A CHIP MADE OF NEURONS
- **Headline:** "Synapses store" / "and compute"
- **VISUAL:** 0.4 s: the two boxes of scene 2 shrink to the left as a grey ghost; on the right a small network of neurons draws, each synapse a green line with a tiny memory cell on it. 3.2 s: a "Program" scroll fades out and is replaced by the label "the structure of the synapses: who connects to whom, how strongly"; two synapse lines thicken, one thins. 6.0 s: a spike raster slides in below: "neuron A" spikes at 2, 5, 6, 11; "neuron B" at 4, 9; "neuron C" at 1, 3, 8, 10, 12 (purple ticks of different heights). Label: "timing and magnitude carry information". 9.6 s: a two-step timeline: "1980s: mixed analogue-digital chips" → "Today: a broad family of brain-inspired techniques" (green). Hold to 13.
- **CAPTIONS:**
  - [0.4, 3.0] "In a neuromorphic computer, synapses store data and process it."
  - [3.2, 5.8] "No program as such: the synapse structure sets what it does."
  - [6.0, 9.4] "Inputs are spikes; their timing and magnitude carry information."
  - [9.6, 12.7] "The term began in the 1980s; today it covers many brain-inspired ideas."
- **SPOKEN:**
  - "Your brain has no separate memory box. In a neuromorphic computer, as in the brain, each synapse both remembers and computes."
  - "There is no program as such. What it does is set by the structure of its synapses, who connects to whom, and how strongly."
  - "Its inputs are spikes, short pulses. Both when they arrive and how big they are carry the information."
  - "The word began in the nineteen eighties, for mixed analogue and digital chips. Today it covers a broad range of brain-inspired techniques."

## Scene 4: `scene-04-superpowers.js`, 12 s
- **Kicker:** FOUR SUPERPOWERS
- **Headline:** "Parallel, collocated," / "scalable"
- **VISUAL:** Three rows build down the stage, each with a small animated pictogram on the left and a card on the right. 0.4 s: row 1 "Parallel": a grid of 16 tiny neurons all pulse at once (green) beside a single orange chef ticking through a queue of 16 jobs one by one. 3.2 s: row 2 "Collocated": the orange "processor here, memory there: every sum needs a trip" card with a packet running across a long gap, beside the green "each synapse stores and computes: no trip needed" with no gap. 6.0 s: row 3 "Scalable": one chip tile, then a second, third and fourth tile snap on, joined by wires; counter "neurons ×4". 8.8 s: a fourth, empty row slot appears with a doorbell icon and "Event driven: next". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Parallel: all neurons work at once, each doing something simple."
  - [3.2, 5.8] "Processing and memory together: faster and less energy."
  - [6.0, 8.6] "Scalable: need a bigger network? Add more chips."
  - [8.8, 11.7] "And the fourth: it is event driven."
- **SPOKEN:**
  - "First, a neuromorphic chip is parallel. All its neurons can work at the same time, and each one does something simple, like a hundred helpers in one kitchen."
  - "Second, processing and memory sit together, in the synapses. No fetching from a distant memory makes it faster, and it uses less energy."
  - "Third, it is scalable. Need a bigger network? Add more chips with more neurons, and connect them."
  - "The fourth superpower is the one Hoglet needs most. It is event driven."

## Scene 5: `scene-05-events.js`, 13 s
- **Kicker:** ONLY WAKE WHEN SOMETHING HAPPENS
- **Headline:** "Clocked chip against" / "event-driven chip"
- **VISUAL:** Night timeline of 24 moments across the stage (x 120..924). Top row: purple spike marks where something happens. Middle row "Clocked chip": 24 orange cells. Bottom row "Event-driven chip": cells green only where a spike arrived, otherwise grey. Right column stat tiles: "Moments with a spike", "Clocked chip works", "Event-driven chip works". 0.4 s: a playhead sweeps the 24 moments (3 s) at 10% activity: spikes at moments 5, 8, 9 and 23 (seed 7); orange cells fill at every moment, green only at those four. Stats end "4 of 24", "24 times", "4 times". 6.0 s: an "activity" slider moves to 50%; the rows redraw: spikes at 11 moments; stats "11 of 24", "24 times", "11 times". 8.8 s: slider drops to 0% (a quiet night): no spikes; event-driven "0 times", clocked still "24 times"; a doorbell icon stays silent. Hold to 13.
- **CAPTIONS:**
  - [0.4, 3.0] "A quiet night: a spike at only 4 of 24 moments."
  - [3.2, 5.8] "The clocked chip works 24 times; the event-driven chip 4."
  - [6.0, 8.6] "A busier garden: 11 spikes, 11 bursts of work."
  - [8.8, 12.7] "No spikes, no work: it computes only when a spike arrives."
- **SPOKEN:**
  - "A neuromorphic chip is like a doorbell. On this quiet night, something happens at only four of twenty-four moments."
  - "A clocked chip checks the door every moment, twenty-four times. The event-driven chip works only four times, when a spike arrives."
  - "When the garden is busier, eleven moments bring a spike, so it works eleven times. The clocked chip still works twenty-four."
  - "With no activity at all, the event-driven chip spends almost nothing. Processing happens only when a spike arrives."

## Scene 6: `scene-06-jobs.js`, 12 s
- **Kicker:** JOBS THAT LOOK LIKE NETWORKS
- **Headline:** "Graphs, optimisation," / "walkers and signals"
- **VISUAL:** Four quadrants filling in turn. 0.4 s: top left "Graph algorithms": six nodes A to F with edges A–B, A–C, B–D, C–D, D–E, D–F, C–F; the route A, B, D, E lights blue hop by hop. 3.2 s: top right "Optimisation": chips "constraint satisfaction", "QUBO", "optimal control", "Bayesian optimisation", plus a small note "LASSO solved with a spiking network". 6.0 s: bottom left "Markov chain random walkers": four flower beds as states; a hedgehog dot hops between them by chance, each bed a neuron. 8.8 s: bottom right "Signal processing": a wavy signal → spikes (purple) → "steer, or raise an alarm" (green), with icons for an autonomous car and a seizure alarm. Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Graph algorithms: routing messages through a network."
  - [3.2, 5.8] "Optimisation: constraint satisfaction, QUBO, optimal control."
  - [6.0, 8.6] "Random walkers hop between neurons that stand for states."
  - [8.8, 11.7] "Signal processing: steering vehicles, detecting seizures."
- **SPOKEN:**
  - "A spiking chip is a network, so problems shaped like networks fit it. Graph algorithms, such as routing a message from A through B and D to E."
  - "Optimisation, from constraint satisfaction and QUBO problems to optimal control and Bayesian optimisation."
  - "Markov chains, where random walkers hop between neurons that stand for states, like a hedgehog wandering between flower beds."
  - "And signal processing, such as steering autonomous vehicles, or spotting brain oscillations to detect seizures."

## Scene 7: `scene-07-chips.js`, 14 s
- **Kicker:** REAL CHIPS, REAL JOBS
- **Headline:** "SpiNNaker, TrueNorth" / "and NorthPole"
- **VISUAL:** Three cards appear left to right, each with a chip pictogram and stat lines that tick in. 0.4 s: "SpiNNaker" card (green): a chip with 18 small core squares; one core labelled "monitor" (runs the operating system), the other 17 "fascicle" (each up to 1,000 neurons). 3.2 s: stat lines: "18 ARM cores", "128 MB shared", "about 16,000 neurons", "8 million synapses", "real time on 1 W". 6.6 s: a tag below: "SpiNNaker 2 (2019): ten times bigger". 8.8 s: "TrueNorth" card (blue): "1 million neurons", "256 million synapses", "programmed in Corelet". 11.2 s: "NorthPole (2023)" card (green): "usable in AI pipelines", "low latency", "efficient without losing accuracy". Hold to 14.
- **CAPTIONS:**
  - [0.4, 3.0] "SpiNNaker: 18 ARM cores per chip, built for exploring."
  - [3.2, 6.4] "About 16,000 neurons in real time on 1 W per chip."
  - [6.6, 8.6] "SpiNNaker 2, in 2019, is ten times bigger."
  - [8.8, 11.0] "IBM TrueNorth: 1 million neurons per chip, set up in Corelet."
  - [11.2, 13.7] "NorthPole, 2023: easier, faster, efficient AI."
- **SPOKEN:**
  - "SpiNNaker has eighteen ARM cores on each chip. One is a monitor running the operating system; the others each model a group of up to a thousand neurons."
  - "One chip models about sixteen thousand neurons and eight million synapses, in real time, on one watt."
  - "It cares more about exploring spiking networks than about accuracy. SpiNNaker two, from twenty nineteen, is ten times bigger."
  - "IBM went big. A TrueNorth chip holds a million neurons and two hundred and fifty-six million synapses, configured in a language called Corelet."
  - "Its successor, NorthPole, from twenty twenty-three, aims to be easy to use in AI pipelines, quick to respond, and efficient without losing accuracy."

## Scene 8: `scene-08-whynot.js`, 13 s
- **Kicker:** SO WHY ISN'T HOGLET NEUROMORPHIC YET?
- **Headline:** "Promising," / "but not there yet"
- **VISUAL:** Two columns. 0.4 s: comparison cards: "Deep learning" (blue): "usually better results today"; "Neuromorphic" (green): "far less energy than edge GPUs"; a balance tips towards deep learning on accuracy and towards neuromorphic on energy. 3.2 s: a red flow strip: "Few machines" → "Special-purpose simulators" → "Long training". 6.0 s: a race track with a stopwatch labelled "ImageNet" in the deep-learning lane; the neuromorphic lane has no stopwatch and a red tag "no shared benchmark that uses timing". 9.4 s: a six-neuron network (a, b → c, d, e → f) is wired by hand, one arrow at a time, by a small cursor; red tag "neuron by neuron: error prone"; green tag "graph problems map readily". Hold to 13.
- **CAPTIONS:**
  - [0.4, 3.0] "Deep learning still wins on results; neuromorphic wins on energy."
  - [3.2, 5.8] "Little hardware and software to use, and long training times."
  - [6.0, 9.2] "No benchmark suite that tests the time aspect."
  - [9.4, 12.7] "Networks are wired neuron by neuron, which is error prone."
- **SPOKEN:**
  - "So far, traditional machine learning is still better, and there are few cases where neuromorphic computing beats deep learning. Where it does win is energy, against edge GPUs."
  - "It is also hard to get hold of. There are few machines, simulators are often built for one purpose, and training takes a long time."
  - "Deep learning had a race to run, such as the ImageNet competition. Neuromorphic computing lacks benchmarks that use timing."
  - "And there are few programming abstractions. Developers design each neuron and synapse by hand, which is error prone, so examples lean on graph problems."

## Scene 9: `scene-09-camera.js`, 12 s
- **Kicker:** A CAMERA THAT ONLY REPORTS CHANGE
- **Headline:** "Send only" / "what changed"
- **VISUAL:** Left: a 12 by 6 pixel grid (dark garden); a 2-pixel-wide hedgehog sits in row 4 at columns 2 and 3. Right panel stats: "Moments", "Frame camera, pixels sent" (orange), "Event camera, pixels sent" (green). 0.4 s: "Frame camera" mode: each moment all 72 pixels flash orange; after 3 moments the stat reads "216" (3 moments × 72). 3.2 s: "Event camera" mode on a fresh count: the hedgehog walks one column per moment; only the 2 pixels whose brightness changed (the one it left, the one it entered) flash green; after 3 moments: frame "216", event "6". 6.0 s: the hedgehog sits still for 2 moments: frame keeps adding 72 each time (to "360"), event adds nothing (stays "6"); note "nothing changed: nothing sent". 8.8 s: a flow strip: "Event camera" → "Frame camera" → "Sensor fusion: best of both" (green), the frame camera snaps one full photo of the hedgehog. Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "A frame camera sends all 72 pixels, every moment."
  - [3.2, 5.8] "An event camera's pixels spike only when brightness changes: 2."
  - [6.0, 8.6] "Hedgehog sits still: the event camera sends nothing."
  - [8.8, 11.7] "Sensor fusion: wake the frame camera when events appear."
- **SPOKEN:**
  - "Hoglet's frame camera sends every pixel, every moment, changed or not. In this tiny picture that is seventy-two pixels each time."
  - "An event camera is modelled on the eye. A pixel spikes only when its brightness changes, so a walking hedgehog costs just two pixels a moment."
  - "When the hedgehog sits still, nothing changes and nothing is sent. Event cameras catch fast movement and use far less power."
  - "Frame cameras still win in some cases, because event cameras do not see a still scene. Sensor fusion combines the two, for a proper photo of the hedgehog."

## Scene 10: `scene-10-units.js`, 12 s
- **Kicker:** EVOLUTION ON A SPIKING CHIP
- **Headline:** "Spike, jump;" / "no spike, step"
- **VISUAL:** 0.4 s: header row: "GA", "PSO" chips with a hot, draining orange battery: "parallel, but energy hungry". 3.2 s: five unit lanes "U1".."U5", each a horizontal 0..10 axis with the candidate's dot and a charge bar beside the lane; a green line marks the best setting so far at 7.2. A "neighbourhood manager" and "selector" box sits above the lanes (green, "global coordination"); the lanes tick asynchronously, not in lock step. 6.0 s: focus on U1 (others dim): start 2.8; tick 1, no spike: steps towards the best, to 5.2 (grey arrow "h_s: heuristic step"); tick 2: 6.3. 8.0 s: tick 3: U1's charge bar fills and it spikes (purple flash): the dot jumps to 1.3 (purple arrow "h_d: own dynamics"); tick 4, no spike: steps to 4.0. 9.8 s: banner: "promising, still highly experimental". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "GAs and PSO are parallel but energy hungry on normal hardware."
  - [3.2, 5.8] "Neuromorphic heuristic units evolve candidates asynchronously."
  - [6.0, 7.8] "No spike: a heuristic step, towards the best so far."
  - [8.0, 9.6] "A spike: the neuron's own dynamics make a jump."
  - [9.8, 11.7] "Promising, but still highly experimental."
- **SPOKEN:**
  - "Priya wants Hoglet to tune its own motion sensitivity with a GA or PSO. They are highly parallel, but energy hungry on ordinary hardware."
  - "Neuromorphic heuristic units evolve candidates asynchronously, with no lock-step generations, while a manager and a selector keep the search on track."
  - "When a unit does not spike, it takes a heuristic step. Here unit one moves from two point eight towards the best, to five point two, then six point three."
  - "When it spikes, the neuron's own dynamics move the candidate. Unit one jumps to one point three, then steps on."
  - "Neuromorphic computing is promising, but still highly experimental."

---

## Scene 11: Recap card (`scene-11-recap.js`, 9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; "Next: Workshop 18.W" tag at about 4.2 s.
1. **Head:** "Synapses store and compute" · **green** · pictogram: two neurons joined by a synapse with a tiny memory cell, no separate memory box.
2. **Head:** "Event driven: work only on spikes" · **purple** · pictogram: a row of grey cells with two lit at spike marks.
3. **Head:** "Thrifty, but still experimental" · **orange** · pictogram: a small battery next to a flask.
- **Spoken (at 0.9 / 2.0 / 3.1):**
  - "A neuromorphic chip stores and processes in its synapses, with no trips to a separate memory."
  - "It is event driven, so it works only when a spike arrives."
  - "It saves a lot of energy, but deep learning still wins on results, and the field is still experimental."
- **Tag:** Next: Workshop 18.W

---

## Chapters
1. Hoglet's von Neumann chip
2. A chip made of neurons
3. Parallel, collocated, scalable
4. Event driven
5. Jobs that look like networks
6. SpiNNaker, TrueNorth, NorthPole
7. Why not yet?
8. The event camera
9. Spiking heuristic units

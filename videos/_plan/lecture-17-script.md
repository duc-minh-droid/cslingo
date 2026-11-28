# Lecture 17 recap video script: Spiking neural networks

**Purpose:** show how a spiking network codes information in spikes over time, how a leaky neuron fills, fires and leaks, how spikes ripple through a network, how STDP learns from spike order, why backpropagation needs a surrogate slope, and how evolution can design the network.

**Target length:** about 2 minutes silent (title 4 s + 9 content scenes, 114 s + recap 9 s = 127 s), about 4 minutes narrated.

**Running example:** Pip, a palm-sized garden rover on one coin battery, with whiskers, a light sensor and a tiny microphone. One synapse runs from a "whisker touched" neuron to a "stop!" neuron.

**Sources:** js/content/nic/l17-01.js (kernel: `encode`, `popCode`, `lif`, `propagate`, `stdp`, `slope`), l17-02.js (17.1 to 17.3), l17-03.js (17.4 to 17.6), l17-workshop.js (17.W). Every number below comes from that kernel (20 time steps, threshold 1) and should be recomputed and asserted at load in `videos/l17/common.js`.

**Colour roles (this video):**
- **orange** = a spike (spike ticks, firing neurons, lit wires), as in the lesson rasters.
- **blue** = input and charge: sensor trains, the charge trace, the pre-synaptic neuron.
- **green** = what Pip needs / what works: the SNN side, potentiation (link strengthened), a usable slope.
- **red** = the threshold line, the costly ANN side, depression (link weakened), "no gradient".
- **purple** = the surrogate curve and the structure (upper level) in evolution.
- **grey** = neutral: silent neurons, axes, idle steps.

**Layout convention:** stage 1080 x 1080, content area x 12..924 under the headline. Spike rasters and traces are wide (x 12..924, rows 60 px tall, 20 time-step columns, "time →" at the right); stats and cards sit in a right panel x 636..924 when the figure is narrower. Text at least 28 px; spike ticks and symbols drawn as SVG.

---

## Scene 1: Title card (`scene-01-title.js`, 4 s)
- **Kicker:** Nature-Inspired · Lecture 17
- **Title:** Spiking neural networks
- **Sub-line:** Neurons that speak only when there is news
- **Spoken (at 0.9):** "Lecture seventeen. Spiking neural networks. This is how a network can talk in brief spikes, and stay quiet when nothing happens."

---

## Scene 2: `scene-02-pip.js`, 12 s
- **Kicker:** A BRAIN FOR A TINY ROBOT
- **Headline:** "Pip needs a brain" / "that sips power"
- **VISUAL:** 0.4 s: Pip (small round rover) drives across the bottom of the stage; a flow strip draws above it: "Whiskers, light, sound" (blue) → "Pip's brain" → "Turn, stop, go" (green). 3.2 s: a coin-battery gauge appears in the right panel. Left card "Conventional ANN" (red): a grid of 12 neurons that all glow every tick, like a shop with every light on; the battery gauge drains fast; tags "costly to train", "high latency", "energy hungry". 6.0 s: right card "What Pip needs" (green): "work only when something happens", "quick reactions", "low power, learns on the go". 8.8 s: the ANN grid is replaced by the same 12 neurons almost all grey; one flashes orange with a short spike tick when a whisker touches a leaf; the battery gauge stops draining. Label: "spiking neural network: discrete spikes over time". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Pip patrols a garden on one coin battery."
  - [3.2, 5.8] "A conventional ANN computes every neuron, every step."
  - [6.0, 8.6] "Pip needs quick reactions, low power and learning on the go."
  - [8.8, 11.7] "An SNN sends discrete spikes only when needed."
- **SPOKEN:**
  - "Meet Pip, a palm-sized rover that patrols a garden on one coin battery. It has whiskers, a light sensor and a tiny microphone."
  - "A conventional neural network passes a number on from every neuron, every step, whether anything changed or not. Pip's battery would be flat by lunch."
  - "Pip needs to react quickly, sip power, and keep learning as the garden changes."
  - "A spiking neural network copies the brain. Neurons stay quiet and send a brief spike only when they have something to say."

## Scene 3: `scene-03-rate.js`, 12 s
- **Kicker:** SPIKE TRAINS
- **Headline:** "Count the spikes:" / "rate coding"
- **VISUAL:** 0.4 s: a raster with four rows over 20 steps (from the lesson's architecture figure): "whisker" 3 spikes, "light" 5, "sound" 2 (all orange ticks), and a blue "neuron" row whose own spikes appear as the three inputs pile up. Arrows from the three rows into a small neuron icon. 3.2 s: raster clears; new rows draw tick by tick left to right (playhead moves over 20 steps in 2.4 s): "dim (2)" gets 2 spikes, "medium (5)" gets 5, "bright (9)" gets 9. 6.0 s: counters at the right end of each row: "2", "5", "9" (orange). 8.8 s: a light-strength slider at the bottom slides from 2 to 9 and the single demo row redraws with more ticks each time; label "strength s out of 10 gives s spikes in 20 steps". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "A neuron's run of spikes over time is a spike train."
  - [3.2, 5.8] "Rate coding: a stronger signal sends more spikes."
  - [6.0, 8.6] "Dim 2, medium 5, bright 9 spikes in 20 steps."
  - [8.8, 11.7] "Only how many count, not their size."
- **SPOKEN:**
  - "Every spike is the same short blip, like a smoke alarm's chirp. Pip's three sensors send spike trains, and one neuron answers with a train of its own."
  - "The first code is rate coding. A stronger signal means more spikes in the same time."
  - "Dim light gives two spikes in twenty steps, medium light five, and bright light nine."
  - "The size of each spike never changes. Only how many there are carries the message."

## Scene 4: `scene-04-timing.js`, 13 s
- **Kicker:** TIMING AND TEAMS
- **Headline:** "When it fires," / "or who fires"
- **VISUAL:** Top half: temporal coding raster, three rows with one spike each: "bright (9)" at step 4, "medium (5)" at step 11, "dim (2)" at step 16. 0.4 s: a playhead sweeps left to right over 20 steps (3 s); each row's single orange spike pops as the playhead reaches it, with a "1st", "2nd", "3rd" finish-line badge. 6.0 s: bottom half: population coding: five rows "likes 0", "likes 2.5", "likes 5", "likes 7.5", "likes 10"; a pointer at "strength 7" above them. 6.6 s: the rows fill: likes 0: none, likes 2.5: none, likes 5: 3 spikes, likes 7.5: 5 spikes, likes 10: 1 spike; the three busy rows' labels turn orange, the two silent ones grey. 9.6 s: a bracket over the busy rows: "the pattern of who is busy says 7". Hold to 13.
- **CAPTIONS:**
  - [0.4, 3.0] "Temporal coding: a strong input fires early, a weak one late."
  - [3.2, 5.8] "Bright fires at step 4, dim at step 16. One spike can be enough."
  - [6.0, 9.4] "Population coding: five neurons, each liking a range."
  - [9.6, 12.7] "Strength 7 wakes the neurons that like 5, 7.5 and 10."
- **SPOKEN:**
  - "The second code is temporal coding. Like runners in a sprint, a strong input fires early and a weak one late."
  - "Bright light fires at step four, medium at step eleven, and dim at step sixteen. One well-timed spike can be enough, which saves energy."
  - "The third code is population coding. Five neurons each prefer a range of strengths."
  - "A strength of seven wakes the neurons that like five, seven and a half, and ten. Which neurons are busy carries the message."

## Scene 5: `scene-05-leaky.js`, 14 s
- **Kicker:** A LEAKY BUCKET THAT FIRES
- **Headline:** "Fill up, tip over," / "or leak away"
- **VISUAL:** Left: a bucket icon whose water level mirrors the charge. Right/centre: a charge trace (x: time steps, y: charge 0..1) with a red dashed threshold line at 1. 0.4 s: input 0.12 per step, no leak, 8 steps: the blue trace climbs in a staircase to 0.96, just under the red line; label "0.96: not yet". 3.6 s: input 0.25 per step, no leak, 20 steps: the trace climbs to 1, an orange spike shoots up from the red line, the trace drops to 0 and repeats; spikes at steps 4, 8, 12, 16, 20; counter "5 spikes". 8.0 s: the bucket gets a hole: input 0.2, leak 0.3: the trace rises and flattens out at about 0.67, never touching the red line; counter "0 spikes"; the hole drips. 11.0 s: label "steady level = input ÷ leak = 0.2 ÷ 0.3 ≈ 0.67". Hold to 14.
- **CAPTIONS:**
  - [0.4, 3.4] "Charge accumulates from inputs, like drops in a bucket."
  - [3.6, 7.8] "At the threshold it fires a spike, resets, and fills again."
  - [8.0, 10.8] "Below-threshold charge leaks away over time."
  - [11.0, 13.7] "With this leak the charge levels off near 0.67: no spike."
- **SPOKEN:**
  - "A spiking neuron holds a charge, like a bucket under a dripping tap. Eight drops of nought point one two fill it to nought point nine six, just short of the line."
  - "With bigger drops of a quarter, it reaches the threshold every fourth step. It fires, resets to empty and fills again. That is five spikes in twenty steps."
  - "Now drill a hole in the bucket. Charge that stays below the threshold slowly leaks away."
  - "With drops of nought point two and this leak, the level settles near two thirds and never fires. Old, weak signals fade, so Pip ignores stray rustles."

## Scene 6: `scene-06-ripple.js`, 13 s
- **Kicker:** RIPPLES THROUGH THE NETWORK
- **Headline:** "Spikes travel" / "one step at a time"
- **VISUAL:** Network (centred, about 700 px wide): inputs A (top left) and B (bottom left); middle neurons A1, A2 (fed by A) and B1, B2 (fed by B); output O on the right with a badge "threshold 3". A step counter "t = 1" in the right panel and a small tally "O receives: 0". Each time step lasts about 2 s; firing neurons and their outgoing wires turn orange. t = 1 (0.4 s): A fires. t = 2 (2.4 s): B fires; A1 and A2 fire. t = 3 (4.4 s): A and B fire; B1 and B2 fire; O receives 2: tally shows "2 of 3", O stays grey. t = 4 (6.6 s): A1, A2, B1 and B2 all fire together. t = 5 (8.8 s): O receives 4, tally "4 of 3 ✓", O fires orange. Hold to 13.
- **CAPTIONS:**
  - [0.4, 2.2] "t = 1: input A fires."
  - [2.4, 4.2] "t = 2: one step later, both of A's neighbours fire."
  - [4.4, 6.4] "O needs 3 spikes at once. Two is not enough."
  - [6.6, 8.6] "t = 4: A's and B's neighbours fire together."
  - [8.8, 12.7] "t = 5: O gets 4 spikes, crosses its threshold and fires."
- **SPOKEN:**
  - "Spikes spread like ripples in a pond. At step one, input A fires."
  - "One step later, both of A's neighbours fire, and B joins in."
  - "Neuron O needs three spikes at once. At step three it gets only two, so it stays quiet."
  - "At step four, A's neighbours and B's neighbours fire together."
  - "So at step five, O receives four spikes at once. It crosses its threshold and fires."

## Scene 7: `scene-07-stdp.js`, 14 s
- **Kicker:** FIRE FIRST, GET CLOSER
- **Headline:** "Spike order" / "sets the strength"
- **VISUAL:** Top: two neurons joined by a synapse: "pre (whisker)" blue on the left, "post (stop!)" orange on the right; the synapse line's thickness shows its weight; a weight counter "w = 0" sits on it. Below: an 8-step raster with rows "pre" (blue ticks) and "post" (orange ticks). 0.4 s: neurons and synapse draw. 3.2 s: pre spikes at steps 2 and 5, post at 3 and 6; each pre-then-post pair is joined by a green arc and "+1"; w goes 0 → 1 → 2, the synapse thickens and turns green: "potentiation". 7.4 s: the raster resets to pre at 3 and 6, post at 2 and 5; each post-then-pre pair gets a red arc and "−1"; w goes 0 → −1 → −2, the synapse thins and turns red: "depression". 10.6 s: a side card "STDP: needs only spike timing, each synapse updates locally, unsupervised" (green) beside a grey card "Backprop (Lecture 16)". Hold to 14.
- **CAPTIONS:**
  - [0.4, 3.0] "A synapse links a pre-synaptic sender to a post-synaptic receiver."
  - [3.2, 7.2] "Pre fires just before post: strengthen. Potentiation."
  - [7.4, 10.4] "Post fires before pre: weaken. Depression."
  - [10.6, 13.7] "No labels needed: STDP is unsupervised learning."
- **SPOKEN:**
  - "A synapse runs from a sender, the pre-synaptic neuron, to a receiver, the post-synaptic neuron. In Pip, whisker touched feeds stop."
  - "Here the whisker neuron fires at steps two and five, and stop follows one step later each time. The whisker probably helped, so the link grows. That is potentiation."
  - "Swap the order, so stop fires first. The whisker clearly did not cause it, and the link weakens. That is depression."
  - "Nobody gives the right answer. The spikes alone are enough, so Pip can tune its own links while it drives. That is unsupervised learning."

## Scene 8: `scene-08-cliff.js`, 12 s
- **Kicker:** WHERE BACKPROP GETS STUCK
- **Headline:** "No slope," / "no direction"
- **VISUAL:** 0.4 s: a flow strip "Output error → Hidden layer → Input weights" with an arrow running backwards (right to left) and a small walker on a smooth grey sigmoid hill feeling the slope with a green arrow: "slope f(a)(1 − f(a))". 3.2 s: the strip fades; two plots side by side. Left plot (blue): the spike function, flat at 0 then a vertical jump to 1 at the threshold. 6.0 s: right plot (red): its slope: flat zero line both sides with one infinitely thin spike at the threshold, labelled "Dirac delta". The walker now stands on the flat left part; a red "?" above it; slope readout "0". 8.8 s: red stamp across the right plot: "no gradient information". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Backpropagation walks back from the error, using each neuron's slope."
  - [3.2, 5.8] "A spiking neuron is 0 below the threshold, then jumps."
  - [6.0, 8.6] "Its slope is the Dirac delta: zero everywhere but one point."
  - [8.8, 11.7] "No gradient information, so plain backprop can't be used."
- **SPOKEN:**
  - "Lecture sixteen's backpropagation starts at the output error and works backwards, feeling the slope of each neuron's function, like walking downhill in fog."
  - "A spiking neuron outputs nought below its threshold, then jumps straight to a spike."
  - "Its slope is the Dirac delta. It is zero everywhere, except one infinitely thin spike at the threshold."
  - "Wherever you stand, the ground is flat. There is no gradient information, so plain backpropagation cannot be used."

## Scene 9: `scene-09-surrogate.js`, 12 s
- **Kicker:** BORROW A SMOOTH STAND-IN
- **Headline:** "A surrogate slope" / "for the backward pass"
- **VISUAL:** One plot: x "a (charge minus threshold)" from −10 to 10, y "slope" from 0 to 5.2. 0.4 s: label strip "forward: real spikes | backward: smooth surrogate". 3.2 s: purple bell for k = 1 draws, low and wide, peak marker "0.25"; a dot at a = 2 shows "0.10". 6.0 s: k = 5 draws, the k = 1 curve turns grey; peak "1.25"; the dot at a = 2 reads "almost 0". 8.8 s: k = 20 draws tall and thin, peak "5"; a faint red Dirac spike outline sits behind it; label "k → ∞: the Dirac delta". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Keep real spikes forward; pretend a smooth sigmoid backward."
  - [3.2, 5.8] "Its slope is a bell centred on the threshold. k = 1: peak 0.25."
  - [6.0, 8.6] "k = 5: peak 1.25, narrower."
  - [8.8, 11.7] "k = 20: peak 5. As k grows, the bell becomes the delta."
- **SPOKEN:**
  - "The fix is a surrogate spiking function. Real spikes still go forward, but when working out slopes, the neuron pretends to be a smooth sigmoid."
  - "The surrogate's slope is a bell centred on the threshold. With a sharpness k of one, it is low and wide, with a peak of nought point two five."
  - "With k of five, the peak rises to one point two five and the bell narrows."
  - "With k of twenty, the peak reaches five. As k grows without limit, the bell becomes the Dirac delta itself."

## Scene 10: `scene-10-evolve.js`, 12 s
- **Kicker:** LET EVOLUTION DESIGN THE BRAIN
- **Headline:** "Evolve the structure," / "then the weights"
- **VISUAL:** 0.4 s: a candidate SNN for Pip with four tags popping onto it: "weights", "delays", "thresholds", "structure"; three candidate brains below it with fitness badges "how well Pip drives". 3.2 s: two stacked boxes: "Upper: structure" (purple, the network's shape changes: a neuron added, a link removed) and "Lower: weights" (blue, link thicknesses change). A switch arrow toggles between them twice: "periodically switch". 6.0 s: cost bars grow on a log-free bar chart with labels: "One SNN test: 1" (green), "One generation (30 SNNs): 30" (orange), "100 generations: 3000" (red). 8.8 s: tags "expensive" and "co-evolve several aspects together: open challenge". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "An EA can tune weights, delays, thresholds and structure."
  - [3.2, 5.8] "Often bi-level: structure upper, weights lower."
  - [6.0, 8.6] "30 networks a generation, 100 generations: 3000 tests."
  - [8.8, 11.7] "Costly, and co-evolving everything at once is still open."
- **SPOKEN:**
  - "Evolution never needed slopes. An evolutionary algorithm can tune an SNN's weights, delays and thresholds, and even its structure. That is neural architecture search."
  - "It is often a bi-level problem. The structure is the upper problem, the weights the lower one, and the search switches between them."
  - "The price is cost. Thirty networks a generation for a hundred generations is three thousand tests, and each SNN is already costly to optimise."
  - "Optimising several aspects together, rather than one at a time, is still an open challenge."

---

## Scene 11: Recap card (`scene-11-recap.js`, 9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; "Next: Workshop 17.W" tag at about 4.2 s.
1. **Head:** "Spikes code by rate, timing or team" · **orange** · pictogram: three short spike-train rows.
2. **Head:** "Leaky neurons fill, fire and reset" · **blue** · pictogram: a sawtooth charge trace under a red dashed line.
3. **Head:** "STDP, surrogates or evolution to learn" · **green** · pictogram: a pre-to-post arrow with "+1" next to a small bell curve.
- **Spoken (at 0.9 / 2.0 / 3.1):**
  - "Spiking networks carry information in how many spikes, when they come, or which neurons fire."
  - "A leaky neuron fills with charge, fires at its threshold and resets, while weak charge leaks away."
  - "They learn by spike order, by a smooth surrogate slope, or by evolution."
- **Tag:** Next: Workshop 17.W

---

## Chapters
1. A brain for a tiny robot
2. Rate coding
3. Timing and population coding
4. The leaky neuron
5. Spikes through a network
6. STDP
7. Where backprop gets stuck
8. Surrogate slopes
9. Evolving a spiking network

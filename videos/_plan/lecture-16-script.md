# Lecture 16 recap video script: Neural networks

**Purpose:** show, in one running story, how a network of simple threshold neurons is built, why one hidden layer solves XOR, why networks bend instead of break, and how an evolutionary algorithm tunes the weights of Mossbrook's rain brain.

**Target length:** about 2 minutes silent (title 4 s + 9 content scenes, 115 s + recap 9 s = 128 s), about 4 minutes narrated.

**Running example:** Nell, the flood warden of Mossbrook. Her old flood rulebook, the canal lock with two gates (XOR), and her "rain brain": a network that predicts sewer flow from rainfall and air temperature (the lecture's case study, Walker et al., 2014).

**Sources:** js/content/nic/l16-01.js (kernel, demos), l16-02.js (16.1 to 16.3), l16-03.js (16.4, 16.5), l16-workshop.js (16.W). All curve numbers below come from the l16-01.js kernel (BIG = 20 hidden neurons, width 0.06; SMALL = 10 hidden neurons, width 0.09; the GA with seed 1) and should be recomputed and asserted at load in `videos/l16/common.js`.

**Colour roles (this video):**
- **green** = fires / output 1 / correct / the computer-vs-brain "brain" side; the evolved fit score.
- **blue** = inputs and the network's guess (blue curve, as in the lesson legend); computer side of the comparison.
- **purple** = the neuron itself (cell body, weighted sum and threshold); the hidden layer.
- **orange** = attention: the held-out storm, the mutated weight, the error (MAE).
- **red** = inhibit / negative weight / a switched-off neuron / a rule that breaks.
- **grey** = neutral: silent neuron (output 0), the dashed real-flow curve, unused items.

**Layout convention:** stage 1080 x 1080, content area x 12..924 below the headline. Big figure on the left (about 600 px wide), a right panel x 636..924 for cards, counters and truth tables. Text at least 28 px; symbols (sum, greater-or-equal, epsilon) drawn as SVG.

---

## Scene 1: Title card (`scene-01-title.js`, 4 s)
- **Kicker:** Nature-Inspired · Lecture 16
- **Title:** Neural networks
- **Sub-line:** Simple neurons, joined by weights, that learn instead of follow rules
- **Spoken (at 0.9):** "Lecture sixteen. Neural networks. This is how many simple neurons, joined by adjustable weights, learn what rules cannot write down."

---

## Scene 2: `scene-02-easy.js`, 12 s
- **Kicker:** EASY FOR WHOM?
- **Headline:** "A calculator wins sums," / "you win faces"
- **VISUAL:** Two columns of task chips. Left column header "Computer" (blue), right column "You" (green). 0.4 s: chip "6,783 × 4,592" slides into the computer column and the answer "31,147,536" pops beside it with a small tick. 3.2 s: chip "Recall 13:04 on a date years ago" joins the computer column. 6.0 s: three chips drop into the "You" column one after another (0.4 s apart): "Catch a ball", "Find faces in CCTV", "Find the car in a photo"; at the same time the computer column greys each of these with a red cross. 8.8 s: the two columns turn into the lesson's comparison table: Computer: "Sequential and very fast", "Rarely makes mistakes", "Memory separate from processing", "Stores information indefinitely"; Human brain: "Distributed architecture", "Learns", "Generalises", "Memory and processing mixed together", "Forgets unimportant things". "Generalises" and "Learns" glow green. Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "A calculator multiplies huge numbers in a flash."
  - [3.2, 5.8] "It also recalls exact facts for ever."
  - [6.0, 8.6] "But catching a ball or spotting a face? You win."
  - [8.8, 11.7] "Brains are distributed: they learn, generalise and forget."
- **SPOKEN:**
  - "Meet Nell, the flood warden of Mossbrook. Her calculator multiplies six thousand seven hundred and eighty-three by four thousand five hundred and ninety-two before she finds a pencil."
  - "It can also recall an exact time on a date years ago, and keep it for ever."
  - "But ask it to catch a ball, or spot a face in a blurry camera image, and it is hopeless. Nell does both without thinking."
  - "A computer works one step after another, with memory kept apart. A brain is distributed. It learns, it generalises, and it forgets what does not matter."

## Scene 3: `scene-03-brain.js`, 12 s
- **Kicker:** THE BRAIN'S DESIGN
- **Headline:** "Many neurons," / "adjustable links"
- **VISUAL:** Left: a field of small grey dots fills in (the "hundred billion" idea), counter in the right panel ticks up to "about 100 billion neurons". 3.2 s: one dot enlarges into a purple neuron; about a dozen thin lines fan out from it to other dots, label "about 10,000 connections each". 6.0 s: zoom on one connection: a small gap between two cells labelled "synapse", with a volume-knob icon on it. The knob turns up (line thickens, green "excite") then down (line thins and turns red, "inhibit"). 8.8 s: the knob turns up again and stays; label "strengthened: this is where learning is thought to happen". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Your brain holds about 100 billion neurons."
  - [3.2, 5.8] "Each one links to around 10,000 others."
  - [6.0, 8.6] "A synapse can excite or inhibit, like a volume knob."
  - [8.8, 11.7] "Synapses can be strengthened: that is where learning lives."
- **SPOKEN:**
  - "The brain does this with neurons. About a hundred billion of them, roughly the raindrops in an Olympic swimming pool."
  - "Each neuron is connected to around ten thousand others."
  - "They talk through synapses, tiny chemical junctions. A synapse can turn the next neuron up, which is excite, or down, which is inhibit."
  - "A synapse can also be strengthened, so the coupling grows. That change is thought to be where learning takes place."

## Scene 4: `scene-04-rules.js`, 12 s
- **Kicker:** RULES OR LEARNING?
- **Headline:** "Write the rules," / "or learn the weights"
- **VISUAL:** Left half: a card "Symbolic AI" with Nell's rulebook line typed out: "IF rain > 20 mm AND ground wet THEN warn". 3.2 s: a storm icon unlike the rule (rain 19 mm, ground soaked) arrives; the rule does not fire and the card cracks red: "outside its scope". 6.0 s: right half: card "Connectionism": a small grey network (3 inputs, 4 hidden, 1 output) whose arrow widths change as numbers appear on them (weights), then the output dot turns green. 8.8 s: tags appear under each card. Symbolic: "easy to read" (green), "fragile" (red). Connectionism: "handles perception", "generalises", "fails gracefully" (green), "black box" (grey). Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Symbolic AI: an expert types in IF-THEN rules."
  - [3.2, 5.8] "Easy to read, but fragile outside its scope."
  - [6.0, 8.6] "Connectionism learns numbers, called weights, in a network."
  - [8.8, 11.7] "It generalises and fails gracefully, but is a black box."
- **SPOKEN:**
  - "Nell's old rulebook says, if rain is over twenty millimetres and the ground is wet, then warn. That is symbolic AI, rules typed in by an expert."
  - "It is easy to read. But a storm the rule never imagined slips straight past it."
  - "Connectionism works differently. It learns numbers, called weights, in a network of simple units."
  - "It handles perception, generalises and fails gracefully. The price is a black box. It is hard to explain why it answered."

## Scene 5: `scene-05-neuron.js`, 14 s
- **Kicker:** ONE NEURON
- **Headline:** "Weigh the inputs," / "fire at the threshold"
- **VISUAL:** Top strip (0.4 s): a biological neuron with three labels appearing in turn: "dendrites: receive" (blue), "cell body: process" (purple), "axon: transmit" (green arrow). 3.2 s: the strip slides up and the McCulloch-Pitts neuron (1943) draws below it: two blue input circles "1" and "1", wires labelled "w = 1" and "w = 1", purple body showing "Σ 2" and "≥ 1.5?", output circle. 6.0 s: the sum fills a bar up past a threshold mark at 1.5; output turns green "1". Right panel: truth table for AND fills row by row: 0 0 → 0, 0 1 → 0, 1 0 → 0, 1 1 → 1. 9.2 s: the threshold mark slides down to 0.5; the table's title changes to OR and rows update to 0, 1, 1, 1 (changed rows flash green). 11.8 s: both weights flip to "−1" (wires turn red), threshold "−1.5"; table title NAND: 1, 1, 1, 0. Hold to 14.
- **CAPTIONS:**
  - [0.4, 3.0] "A neuron listens, decides, and passes it on."
  - [3.2, 5.8] "McCulloch and Pitts, 1943: inputs times weights, then add."
  - [6.0, 9.0] "1 + 1 = 2 clears a threshold of 1.5, so it fires. That is AND."
  - [9.2, 11.6] "Lower the threshold to 0.5: one input is enough. OR."
  - [11.8, 13.7] "Negative weights inhibit: weights −1, threshold −1.5 give NAND."
- **SPOKEN:**
  - "A real neuron listens through its dendrites, decides in the cell body, and passes a pulse along its axon."
  - "In nineteen forty-three, McCulloch and Pitts made an artificial one. Each input is multiplied by a weight, and the neuron adds them up."
  - "Inputs one and one, with weights one and one, make two. That clears a threshold of one point five, so it fires. Only both inputs together do that, so this is AND."
  - "Now the threshold drops to nought point five. A single input is enough, and the same neuron becomes OR."
  - "Turn both weights to minus one and the threshold to minus one point five. The inputs now inhibit, and the neuron becomes NAND."

## Scene 6: `scene-06-xor.js`, 12 s
- **Kicker:** THE GATE ONE NEURON CAN'T MAKE
- **Headline:** "Exactly one gate open:" / "XOR"
- **VISUAL:** Left: a canal lock with two gates; a warning lamp. 0.4 s: gates cycle through the four cases (closed/closed, open/closed, closed/open, open/open) and the lamp glows orange only for the two middle cases. Right panel: XOR truth table fills: 0 0 → 0, 0 1 → 1, 1 0 → 1, 1 1 → 0. 3.2 s: the lock fades; a square plot with four corner points appears: (0,0) and (1,1) grey, (0,1) and (1,0) green. 6.0 s: a single straight dashed purple line (one neuron) tries three positions in turn; each time a red cross marks a point on the wrong side. 8.8 s: a red label "no single straight line works". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "Nell's lock lamp should glow when exactly one gate is open."
  - [3.2, 5.8] "That rule is XOR. Its 'on' cases sit in opposite corners."
  - [6.0, 8.6] "One neuron draws one straight line."
  - [8.8, 11.7] "No straight line separates XOR. One neuron can't do it."
- **SPOKEN:**
  - "Mossbrook's canal lock has two gates. A warning lamp should glow when exactly one gate is open, never both and never neither."
  - "That rule is called XOR, exclusive or. Its two on cases sit in opposite corners of the square."
  - "A single neuron can only split the square with one straight line."
  - "Wherever the line goes, one corner lands on the wrong side. No single neuron can compute XOR. Early networks got stuck right here."

## Scene 7: `scene-07-hidden.js`, 14 s
- **Kicker:** ONE MORE LAYER
- **Headline:** "Two hidden neurons" / "make XOR"
- **VISUAL:** Left: network, 2 blue inputs on the left, a purple hidden layer of two neurons labelled "OR" and "NAND", one output neuron labelled "AND". Right panel: a four-row table with columns x1 x2 | OR NAND | out. 0.4 s: network draws in left to right. 3.2 s onwards: the four input rows are played in turn, about 1.6 s each, in the order 0 0, 1 1 (during the 3.2 caption), then 0 1, 1 0 (during the 6.6 caption): input circles light blue for 1; each hidden neuron that fires turns green; the output turns green or stays grey; the row's cells fill in: 0 0 → OR 0, NAND 1 → 0; 0 1 → 1, 1 → 1; 1 0 → 1, 1 → 1; 1 1 → 1, 0 → 0. 9.6 s: the out column is outlined green and labelled "= XOR". 11.4 s: the network widens into a generic multi-layer perceptron: "Input → Hidden → Output", with the example "car attributes → fuel use". Hold to 14.
- **CAPTIONS:**
  - [0.4, 3.0] "Add a hidden layer: OR and NAND feed an AND."
  - [3.2, 6.4] "0 0 and 1 1: the hidden pair disagree, so no light."
  - [6.6, 9.4] "0 1 and 1 0: both agree, so the output fires."
  - [9.6, 11.2] "That is XOR from three neurons."
  - [11.4, 13.7] "The multi-layer perceptron: Rumelhart and McClelland, 1986."
- **SPOKEN:**
  - "The fix is teamwork. Two hidden neurons check at least one gate open, which is OR, and not both open, which is NAND. An AND neuron reads them."
  - "With both gates shut, OR stays silent. With both open, NAND stays silent. Either way the output stays dark."
  - "With exactly one gate open, OR and NAND both fire, so the AND output fires."
  - "Three neurons, two layers, and XOR is solved."
  - "Rumelhart and McClelland made this famous in nineteen eighty-six. It is the multi-layer perceptron, and learning means finding all its weights."
## Scene 8: `scene-08-degrade.js`, 13 s
- **Kicker:** BEND, DON'T BREAK
- **Headline:** "Lose a neuron," / "keep going"
- **VISUAL:** Left: the storm plot (time 0 to 1 across, flow 0 to 1 up, peak at time 0.3): dashed grey "real flow" curve and the blue "network's guess" from the 20-neuron network (BIG). Under the plot a row of 20 green numbered cells "1".."20". Right panel: stat "Neurons working 20 of 20" and green stat "Fit score (best 1) 0.99". 0.4 s: plot and curves draw. 3.2 s: a lightning bolt strikes cell 7 (near the peak); it turns red; the blue curve dips a little around time 0.3; stats change to "19 of 20" and "0.83" (orange flash on the number). 6.0 s: on the right a small symbolic "calculator" icon loses one wire and its screen goes red: "fails". 8.8 s: side-by-side tags: network "performance drops" (orange), rules "total failure" (red). 10.6 s: five italic, bold and wobbly letter A chips appear across the top with a green tick: "learned patterns generalise". Hold to 13.
- **CAPTIONS:**
  - [0.4, 3.0] "Nell's rain brain: 20 hidden neurons, fit score 0.99."
  - [3.2, 5.8] "Lightning knocks out neuron 7. Fit score 0.83."
  - [6.0, 8.6] "Pull one wire from a rule system and it usually fails."
  - [8.8, 10.4] "That is graceful degradation."
  - [10.6, 12.7] "Learned patterns also generalise to new cases and noise."
- **SPOKEN:**
  - "Here is Nell's rain brain with twenty hidden neurons. Its guess follows the real flow closely, with a fit score of nought point nine nine."
  - "Lightning knocks out neuron seven, near the peak. The curve dips a little there, and the fit score falls to nought point eight three."
  - "Pull one wire from a symbolic system, and it usually stops working altogether."
  - "The network's performance drops, but it probably does not fail. That is graceful degradation, like the brain's tolerance of damage."
  - "Because it learned common patterns, it also copes with new cases and noise, like an A written in a wobbly hand."

## Scene 9: `scene-09-runoff.js`, 12 s
- **Kicker:** MOSSBROOK'S RAIN BRAIN
- **Headline:** "Rain in," / "sewer flow out"
- **VISUAL:** 0.4 s: a flow strip draws left to right: "Rainfall" and "Air temperature" (blue) → "Neural network" (purple, small sketch: 10 hidden neurons, 1 output) → "Sewer flow" (green). 3.2 s: below it 15 blue storm bars (heights 5 8 3 9 6 4 7 10 5 3 8 6 9 4 7), caption strip "15 storms, January 2010 to October 2012". 6.0 s: cross-validation: bar 1 turns orange ("test"), others stay blue ("train"); then the orange highlight steps through bars 2, 3, 4 (0.6 s each) with a counter "Split 1 of 15", "Split 2 of 15", ... 8.8 s: a row of 8 weight boxes (0.3, −0.5, 0.8, 0.1, −0.2, 0.6, 0.4, −0.7) labelled "one genome = one complete set of weights". Hold to 12.
- **CAPTIONS:**
  - [0.4, 3.0] "The case study: rainfall and temperature in, sewer flow out."
  - [3.2, 5.8] "15 rainfall events, January 2010 to October 2012."
  - [6.0, 8.6] "Cross-validation: each split holds one storm back for testing."
  - [8.8, 11.7] "Train with an EA: each solution is a complete set of weights."
- **SPOKEN:**
  - "Now the real job. In towns, rain runs off hard ground into the drains. The network takes rainfall and air temperature, and predicts sewer flow."
  - "The data cover fifteen rainfall events, from January twenty ten to October twenty twelve."
  - "To check it generalises, each split holds one storm back for testing and trains on the other fourteen. That is cross-validation."
  - "Instead of backpropagation, an evolutionary algorithm trains it. Each individual is one complete set of weights, a list of numbers."

## Scene 10: `scene-10-evolve.js`, 14 s
- **Kicker:** EVOLVING THE WEIGHTS
- **Headline:** "Mutate, keep the best," / "watch the error fall"
- **VISUAL:** Left: the storm plot with the dashed grey real flow and the blue guess of the best of 12 weight sets (SMALL network, 10 hidden neurons, GA seed 1). Right panel: stats "Generation", orange "Error (MAE)", green "Fit score (NSE)", and a 10-bar strip of the best genome's weights. 0.4 s: generation 0: guess is poor; MAE 0.407, NSE −1.95. 3.2 s: mutation close-up: one of the weight bars flashes orange and nudges, label "+ ε, small Gaussian noise"; a second label "crossover mixes two parents". 6.0 s: generations run (counter 0 → 20 over 2.6 s, curve redrawn each step): at 10 MAE 0.157, NSE 0.59; at 20 MAE 0.072, NSE 0.92 (NSE turns green when it passes 0.9). 8.8 s: counter runs on to 50: MAE 0.023, NSE 0.99; a small MAE-over-generations sparkline in the right panel shows the fast-then-slow fall. 11.0 s: a darts board icon with "1 = perfect, 0 = guessing the average, no lower limit". Hold to 14.
- **CAPTIONS:**
  - [0.4, 3.0] "Fitness is the mean absolute error, MAE. Start: 0.407."
  - [3.2, 5.8] "Mutation adds small Gaussian noise to one weight."
  - [6.0, 8.6] "Generation 20: MAE 0.072, Nash-Sutcliffe 0.92."
  - [8.8, 10.8] "Generation 50: NSE 0.99. Fast at first, then slow."
  - [11.0, 13.7] "NSE: best 1, guessing the average scores 0, no lower limit."
- **SPOKEN:**
  - "Twelve weight sets compete. Fitness is the mean absolute error between guess and real flow. The best starts at nought point four zero seven."
  - "Crossover mixes two parents. Mutation picks one weight and nudges it by a small Gaussian random amount."
  - "By generation twenty the error is nought point nought seven two, and the Nash-Sutcliffe score has climbed to nought point nine two."
  - "By generation fifty it reaches nought point nine nine. The error fell fast at first, then crept down, and the best is always kept."
  - "On the Nash-Sutcliffe scale, one is perfect, guessing the average scores nought, and a bad model has no lower limit."

---

## Scene 11: Recap card (`scene-11-recap.js`, 9 s)
Rows slide in at 0.8 / 1.9 / 3.0 s; "Next: Workshop 16.W" tag at about 4.2 s.
1. **Head:** "Neuron = weighted sum + threshold" · **purple** · pictogram: two inputs into a circle with "≥", output dot.
2. **Head:** "A hidden layer solves XOR" · **green** · pictogram: 2-2-1 network, the output dot lit.
3. **Head:** "Bend, don't break; evolve the weights" · **orange** · pictogram: a curve with a small dip plus a weight bar with "+ε".
- **Spoken (at 0.9 / 2.0 / 3.1):**
  - "A neuron weighs its inputs and fires when the sum reaches its threshold."
  - "One hidden layer of neurons can compute XOR, which one neuron cannot."
  - "Networks degrade gracefully, and their weights are numbers that evolution can tune."
- **Tag:** Next: Workshop 16.W

---

## Chapters
1. Easy for whom?
2. The brain's design
3. Rules or learning
4. One neuron, three gates
5. The XOR problem
6. A hidden layer
7. Graceful degradation
8. Mossbrook's rain brain
9. Evolving the weights

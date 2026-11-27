/* l16-02: Lecture 16 lessons 16.1 to 16.3: brains versus computers, a single neuron (demo), and the hidden layer that solves XOR. Kernel, figures and demos come from l16-01.js (NIC.shared.nicL16). Running example: Mossbrook's flood warden Nell and her "rain brain". */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL16;
  const { C, pr, svg, txt, circ, wire, neuronSvg, bioNeuron, layersSvg, xorFig } = sh;

  const twoCol = (a, b, ha, hb) =>
    `<div class="nw16-two"><div class="card"><h3>${ha}</h3><ul>${a.map((x) => `<li class="fi">${x}</li>`).join("")}</ul></div><div class="card"><h3>${hb}</h3><ul>${b.map((x) => `<li class="fi">${x}</li>`).join("")}</ul></div></div>`;
  const chips = (xs) =>
    `<div class="nw16-chips">${xs.map(([t, c]) => `<span class="tag nw16-chip ${c}">${t}</span>`).join("")}</div>`;

  // ---------- 16.1 why your brain beats a calculator (no demo) ----------
  N.register({
    id: "l16-brain",
    lecture: 16,
    order: 1,
    num: "16.1",
    title: "Why your brain beats a calculator",
    blurb: "Computers multiply in a blink but can't catch a ball. What does a brain do differently?",
    render(root) {
      root.appendChild(header(this, "Brains, computers and two ways to build intelligence."));
      root.appendChild(
        takeaways(
          [
            "Computers are fast, exact and keep memory apart from processing; brains are <b>distributed</b>, <b>learn</b> and <b>generalise</b>.",
            "A brain has about <b>100 billion neurons</b>, each linked to about <b>10,000</b> others through <b>synapses</b>.",
            "<b>Symbolic AI</b> programs rules; <b>connectionism</b> learns weights in a network of simple units.",
          ],
          "Brains learn and generalise; that is what neural networks borrow.",
        ),
      );
    },
  });

  L["l16-brain"] = {
    sum: "Computers are fast and exact but poor at perception and learning; brains are massively parallel, learn, generalise and forget. Neural networks borrow the brain's design: many neurons joined by adjustable synapses. Connectionism (learned weights) is the alternative to symbolic AI (programmed rules).",
    steps: [
      {
        t: "Easy for whom?",
        b: `<p>Meet Nell, the flood warden in the village of Mossbrook. A pocket calculator multiplies 6,783 by 4,592 before she has found a pencil. But ask it to <b>catch a ball</b> or <b>spot a face</b> in a blurry camera image, and it is hopeless, while Nell does both without thinking.</p><p>So "easy" depends on the machine. This lecture is about copying the machine that finds faces easy: the <b>brain</b>.</p>`,
        v: chips([
          ["Multiply huge numbers: computer", "blue"],
          ["Recall 13:04 on a date years ago: computer", "blue"],
          ["Catch a ball: you", "teal"],
          ["Find faces in CCTV: you", "teal"],
          ["Find the car in a photo: you", "teal"],
        ]),
      },
      {
        t: "Two very different machines",
        b: `<p>A computer is like a lightning-fast clerk with a separate filing cabinet: it works <b>one step after another</b>, rarely errs (barring floating-point slips), keeps <b>memory apart from processing</b>, and stores things forever.</p><p>A brain is more like a crowd of helpers who all hold a little of the memory. It is <b>distributed</b>, it <b>learns</b>, it <b>generalises</b> to new things, and it <b>forgets</b> what does not matter.</p>`,
        v: twoCol(
          [
            "Sequential and very fast",
            "Rarely makes mistakes",
            "Memory separate from processing",
            "Stores information indefinitely",
          ],
          [
            "Distributed architecture",
            "Learns",
            "Generalises",
            "Memory and processing mixed together",
            "Forgets unimportant things",
          ],
          "Computer",
          "Human brain",
        ),
        c: C(
          "Which of these is a strength of the brain rather than of a conventional computer? | Generalising to things it has never seen | Storing information indefinitely without loss | Doing long sums one step at a time, very fast | Generalisation is on the brain's side of the lecture's list. Exact storage and fast sequential steps are the computer's strengths.",
        ),
      },
      {
        t: "A hundred billion tiny workers",
        b: `<p>Your brain holds about <b>100 billion neurons</b>: roughly the number of raindrops it takes to fill an Olympic swimming pool. Each one is connected to around <b>10,000</b> others.</p><p>Neurons talk through <b>synapses</b>, tiny chemical junctions between cells. Think of each synapse as a volume knob on a phone line: it can be turned up or down. That adjustability is where the magic hides.</p>`,
        v: svg(
          360,
          150,
          [40, 110, 180, 250, 320].map((x, i) => circ(x, 60 + (i % 2) * 40, 16, "var(--violet)")).join("") +
            [0, 1, 2, 3]
              .map((i) => wire(40 + i * 70, 60 + (i % 2) * 40, 110 + i * 70, 60 + ((i + 1) % 2) * 40, 0.4, "amber"))
              .join("") +
            txt(180, 140, "≈ 100 billion neurons, ≈ 10,000 links each", "nw16-lab s"),
          "Neurons joined by synapses: about 100 billion neurons, each linked to about 10,000 others.",
        ),
      },
      {
        t: "Rules or learning?",
        b: `<p>Nell's old flood rulebook says "IF rain over 20 mm AND ground wet THEN warn". That is <b>symbolic AI</b>: explicit IF-THEN rules typed in by an expert, easy to read, but fragile and useless outside its scope.</p><p><b>Connectionism</b> instead learns numbers (weights) in a network of simple units. It handles perception, generalises and fails gracefully, but is a <b>black box</b>: hard to explain why it answered.</p>`,
        v: `<table class="t nw16-tbl"><tr><th>Symbolic AI</th><th>Connectionism</th></tr><tr><td>Explicit reasoning (symbols)</td><td>Implicit reasoning (numbers)</td></tr><tr><td>Expert system, IF-THEN rules</td><td>Neural network, weighted graph</td></tr><tr><td>Knowledge programmed</td><td>Knowledge learned</td></tr><tr><td>Serial, fragile</td><td>Distributed, graceful degradation</td></tr><tr><td>Doesn't generalise beyond scope</td><td>Generalises</td></tr><tr><td>Interpretable</td><td>Black box</td></tr></table>`,
        c: C(
          "Nell's colleague wants a flood system whose every decision can be read and checked line by line. Which approach fits that wish? | Symbolic AI, with explicit IF-THEN rules | Connectionism, with learned weights in a network | Either one, since both are equally easy to read | Symbolic systems are interpretable. A neural network's knowledge sits in thousands of numbers, which is why the lecture calls it a black box.",
        ),
      },
    ],
  };

  // ---------- 16.2 meet a single neuron (demo) ----------
  N.register({
    id: "l16-neuron",
    lecture: 16,
    order: 2,
    num: "16.2",
    title: "Meet a single neuron",
    blurb: "Dendrites listen, the body decides, the axon speaks. Then build an artificial one and make it do logic.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "One artificial neuron with two inputs. Move the <b>weights</b> and the <b>threshold</b> and watch which logic gate it becomes.",
        ),
      );
      sh.neuronDemo(root, life);
      root.appendChild(
        pr(
          "l16-neuron-1",
          "You set both weights to 1 and turned the threshold down from 1.5 to 0.5. What changed? | It went from AND to OR: one active input is now enough | It went from OR to AND: both inputs are now needed | Nothing: the weights decide the gate, not the threshold | With weights 1 and 1, one input gives a sum of 1. That clears 0.5 but not 1.5, so a lower threshold lets a single input fire the neuron.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A neuron has <b>dendrites</b> (receive), a <b>cell body</b> (process) and an <b>axon</b> (transmit).",
            "<b>Synapses</b> excite or inhibit, and can be strengthened: that is where learning is thought to happen.",
            "<b>McCulloch and Pitts (1943)</b>: an artificial neuron can compute simple logic such as AND and OR.",
          ],
          "Weights are the synapses; changing them is learning.",
        ),
      );
    },
  });

  L["l16-neuron"] = {
    sum: "A neuron receives signals on its dendrites, processes them in the cell body and transmits a pulse along its axon. Synapses can excite or inhibit and be strengthened, which is thought to be where learning happens. McCulloch and Pitts (1943) built an artificial neuron that computes simple logic.",
    steps: [
      {
        t: "Listen, decide, pass it on",
        b: `<p>Think of a neuron as a gossip at a party. It <b>listens</b> to many friends, <b>decides</b> whether the news is exciting enough, and if so <b>passes it on</b>.</p><p>The listening ears are the <b>dendritic tree</b> (receives signals), the decision happens in the <b>cell body</b> (processes them), and the <b>axon</b> carries the pulse onwards (transmits). The idea that thinking comes from such networks is called <b>connectionism</b>.</p>`,
        v: bioNeuron(),
        c: C(
          "Which part of a neuron receives the incoming signals? | The dendrites | The axon | The cell body | Dendrites receive, the cell body processes and the axon transmits.",
        ),
      },
      {
        t: "Where learning lives",
        b: `<p>Between two neurons sits a <b>synapse</b>, a chemical junction. It can <b>excite</b> the next neuron (turn it up) or <b>inhibit</b> it (turn it down).</p><p>Like a friendship that grows stronger the more you chat, a synapse can release more neurotransmitter and <b>strengthen the coupling</b> between two cells. Because it can be modified, the synapse is thought to be <b>where learning takes place</b>.</p>`,
        v: svg(
          360,
          120,
          wire(20, 60, 150, 60, 1.5, "amber") +
            circ(160, 60, 12, "var(--amber)") +
            [0, 1, 2].map((i) => circ(180 + i * 6, 48 + i * 12, 3, "var(--violet)")).join("") +
            `<path class="draw" d="M200 40 Q215 60 200 80" fill="none" stroke="var(--blue)" stroke-width="5"/>` +
            wire(205, 60, 340, 60, 1.5, "blue") +
            txt(80, 40, "axon") +
            txt(270, 40, "next dendrite") +
            txt(185, 108, "synapse: excite (+) or inhibit (−)", "nw16-lab s"),
          "A synapse: the axon end releases chemicals across a gap to the next neuron's dendrite.",
        ),
      },
      {
        t: "A neuron made of numbers",
        b: `<p>In 1943, <b>McCulloch and Pitts</b> made the first <b>artificial neuron</b>. Each input is multiplied by a <b>weight</b> (the synapse's volume knob: positive excites, negative inhibits). The neuron adds them up and <b>fires</b> if the total reaches a <b>threshold</b>.</p><p>Here inputs 1 and 1 with weights 1 and 1 make 2, which clears a threshold of 1.5, so it fires.</p><details class="math-more"><summary>Show the maths</summary><p>The usual textbook form (more detail than the slides give): with inputs $x_i$, weights $w_i$ and threshold $\\theta$,</p>$$y=\\begin{cases}1 & \\text{if } \\sum_i w_i x_i \\ge \\theta\\\\ 0 & \\text{otherwise}\\end{cases}$$</details>`,
        v: neuronSvg([1, 1], [1, 1], 1.5),
      },
      {
        t: "Logic from a single cell",
        b: `<p>With the right weights and threshold, that one neuron becomes a <b>logic gate</b>. Need <b>both</b> inputs to fire? That's <b>AND</b>. Is <b>either</b> enough? That's <b>OR</b>.</p><p>McCulloch and Pitts showed their neuron could process such <b>simple logical expressions</b>. Here the same weights with a lower threshold, 0.5, let a single input through. In the demo you can turn the knobs yourself.</p>`,
        v: neuronSvg([0, 1], [1, 1], 0.5),
        c: C(
          "A neuron should fire only when both of Nell's sensors (rain and wet ground) are on. Which gate is that? | AND | OR | NOR | Both inputs must be 1, which is AND. OR would fire on either sensor alone.",
        ),
      },
    ],
    guide: [
      "Start at weights 1 and 1, threshold 1.5: the table shows AND.",
      "Drag <b>Threshold θ</b> down to 0.5 and watch the table change.",
      "Make both weights negative and find a threshold that gives NAND.",
      "Tap rows of the table to feed the neuron different inputs, then answer the question after the demo.",
    ],
  };

  // ---------- 16.3 one more layer (no demo) ----------
  N.register({
    id: "l16-mlp",
    lecture: 16,
    order: 3,
    num: "16.3",
    title: "One more layer",
    blurb: "A single neuron can't do XOR. Add a hidden layer and suddenly it can: the multi-layer perceptron.",
    render(root) {
      root.appendChild(header(this, "XOR, hidden layers and what neural networks are used for."));
      root.appendChild(
        takeaways(
          [
            "A single neuron cannot compute <b>XOR</b>; a <b>hidden layer</b> fixes it.",
            "<b>Rumelhart and McClelland (1986)</b>, <i>Parallel Distributed Processing</i>, popularised the <b>multi-layer perceptron</b>.",
            "Networks <b>learn to relate inputs to outputs</b>: fuel use from car features, stock prices, cancer from blood values.",
          ],
          "Stack neurons in layers and they can learn much more.",
        ),
      );
    },
  });

  L["l16-mlp"] = {
    sum: "One neuron cannot compute XOR. Adding a layer of hidden neurons, as in Rumelhart and McClelland's 1986 Parallel Distributed Processing, gives the multi-layer perceptron, one of the most widely used machine learning techniques. Networks learn to relate input variables to a required output.",
    steps: [
      {
        t: "The gate one neuron can't make",
        b: `<p>Mossbrook's canal lock has two gates. A warning light should glow when <b>exactly one</b> gate is open, never both, never neither. That rule is <b>XOR</b> ("exclusive or").</p><p>Try as you might, no single neuron can do it: one neuron draws one straight dividing line, and XOR's "on" cases sit in opposite corners. Early neural networks got stuck right here.</p><details class="math-more"><summary>Show the maths</summary><p>(Beyond the slides.) A single threshold neuron fires when $w_1x_1+w_2x_2\\ge\\theta$: one side of a straight line. XOR needs $(0,1)$ and $(1,0)$ on one side and $(0,0)$ and $(1,1)$ on the other, and no straight line separates them.</p></details>`,
        v: svg(
          300,
          170,
          [
            [0, 0, 0],
            [0, 1, 1],
            [1, 0, 1],
            [1, 1, 0],
          ]
            .map(
              ([a, b, y]) =>
                circ(70 + a * 160, 140 - b * 110, 16, y ? "var(--teal)" : "var(--rose)") +
                txt(70 + a * 160, 145 - b * 110, y, "nw16-lab b"),
            )
            .join("") + txt(150, 90, "no single straight line splits green from red", "nw16-lab s"),
          "XOR: the inputs (0,1) and (1,0) give 1, the inputs (0,0) and (1,1) give 0; they sit in opposite corners.",
        ),
        c: C(
          "Why can't one artificial neuron compute XOR? | It can only split its inputs with one straight line | It can only have one input at a time | Its weights are not allowed to be negative | XOR's 1s sit in opposite corners, and one neuron's single dividing line cannot separate them.",
        ),
      },
      {
        t: "Add a hidden layer",
        b: `<p>The fix is teamwork. Put two neurons in a <b>hidden layer</b>: one checks "at least one gate open" (OR), the other "not both open" (NAND). An output neuron fires when <b>both</b> agree (AND). That is XOR.</p><p>Rumelhart and McClelland's 1986 book <i>Parallel Distributed Processing</i> made this idea famous: the <b>multi-layer perceptron</b>. Tap rows to test it.</p>`,
        v: (b) => xorFig(b),
      },
      {
        t: "Layers in general",
        b: `<p>A multi-layer perceptron is like a relay of committees. <b>Input</b> units take the data, one or more <b>hidden</b> layers pass along weighted votes, and <b>output</b> units give the response. Every arrow carries a <b>weight</b>.</p><p>It became one of the <b>most widely used</b> machine learning techniques. Learning means finding good values for all those weights.</p>`,
        v: layersSvg(3, 4, 1, ["input data", "hidden units", "output response"]),
      },
      {
        t: "What can it learn?",
        b: `<p>Show a network enough examples and it <b>learns to relate input variables to the required output</b>, like a trainee who watches an expert for months.</p><p>The lecture's examples: car attributes in, <b>fuel consumption</b> out; past prices in, <b>stock market</b> forecast out; <b>blood values</b> in, cancerous or not out. Nell's plan is the same shape: storm data in, drain flow out.</p>`,
        v: F.flow(["Inputs (car attributes)", "Hidden layer", { t: "Output (fuel use)", c: "teal" }]),
        c: C(
          "Which task has the same shape as the lecture's neural network examples? | Predict a patient's diagnosis from their blood test values | Sort a long list of customer names into alphabetical order | Add up a whole column of shop prices exactly, to the penny | Networks learn a mapping from input variables to an output from examples. Sorting and exact sums are rule jobs a normal program does perfectly.",
        ),
      },
    ],
  };
})();

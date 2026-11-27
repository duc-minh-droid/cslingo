/* l18-02: Lecture 18 lessons 18.1 to 18.3: two ways to build a computer, the four strengths of neuromorphic chips (demo), and the real machines and their jobs. Figures and demos come from l18-01.js (NIC.shared.nicL18). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL18;
  const { C, pr, shuttleFig, spikeFig, netFig, eventDemo } = sh;

  // ---------- 18.1 two ways to build a computer (no demo) ----------
  N.register({
    id: "l18-brain",
    lecture: 18,
    order: 1,
    num: "18.1",
    title: "A computer shaped like a brain",
    blurb:
      "Why Hoglet's battery keeps dying, and a chip built from neurons and synapses instead of a processor and memory.",
    render(root) {
      root.appendChild(header(this, "von Neumann machines against neuromorphic machines."));
      root.appendChild(
        takeaways(
          [
            "A <b>von Neumann</b> computer keeps a processor and a separate memory, follows a program and works in binary.",
            "A <b>neuromorphic</b> computer uses synapses to store and process at once; the synapses' structure is the program.",
            "Its inputs are <b>spikes</b>: their timing and magnitude carry the information.",
          ],
          "Neuromorphic: memory and processing live together, and spikes carry the message.",
        ),
      );
    },
  });

  L["l18-brain"] = {
    sum: "A von Neumann computer shuttles binary data between a processor and memory and follows a program. A neuromorphic computer stores and processes in its synapses, is 'programmed' by their structure, and takes spikes as input. The term dates from 1980s mixed analogue-digital chips and now covers many brain-inspired techniques.",
    steps: [
      {
        t: "Meet Hoglet",
        b: `<p>Priya has built <b>Hoglet</b>, a little camera that watches her garden for hedgehogs all night. Its battery dies by Tuesday.</p><p>Inside is an ordinary <b>von Neumann</b> computer: a <b>processor</b> that does the sums and a separate <b>memory</b> that stores the data. A <b>program</b> tells it what to do, step by step, and everything is coded in <b>binary</b>. The catch: data shuttles back and forth between the two all night, and every trip costs time and energy.</p>`,
        v: shuttleFig(),
      },
      {
        t: "A chip made of neurons",
        b: `<p>Your brain has no separate memory box. Each <b>synapse</b>, the link between two neurons, both remembers and computes.</p><p>A <b>neuromorphic</b> computer copies that. Synapses <b>store the data and do the processing</b>. There is no program as such: what it does is set by the <b>structure of its synapses</b>, who connects to whom and how strongly. Its inputs are <b>spikes</b>, short pulses, and both their <b>timing</b> and their <b>magnitude</b> carry the information. (Spiking networks are Lecture 17's topic.)</p>`,
        v: spikeFig(),
        c: C(
          "In a neuromorphic computer, what plays the part of the program? | The structure of the synapses | A list of binary instructions in memory | The processor's clock speed | Instructions are determined by how the synapses are connected and weighted, not by a stored program.",
        ),
      },
      {
        t: "Where the word came from",
        b: `<p>Words drift. "Computer" once meant a person doing sums.</p><p><b>Neuromorphic computing</b> began in the <b>1980s</b>, meaning <b>mixed analogue-digital</b> hardware that copied brain techniques. Today it covers a <b>broad range of brain-inspired techniques</b>. The common thread is still the one Hoglet needs: compute like a brain, with spikes, and stop paying for all those trips to memory.</p>`,
        v: F.flow([
          { t: "1980s", s: "mixed analogue-digital chips" },
          { t: "Today", s: "a broad family of brain-inspired techniques", c: "teal" },
        ]),
        c: C(
          "What did 'neuromorphic' first refer to in the 1980s? | Mixed analogue-digital hardware copying the brain | Software that trains deep networks with backpropagation | Any computer with more than one processor | The term began with mixed analogue-digital implementations of brain-inspired techniques and has since broadened.",
        ),
      },
    ],
  };

  // ---------- 18.2 four strengths (demo) ----------
  N.register({
    id: "l18-powers",
    lecture: 18,
    order: 2,
    num: "18.2",
    title: "Four superpowers",
    blurb: "Parallel, memory next door, add more chips, and only wake up when something happens.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Hoglet's night as 24 moments. A <b>clocked chip</b> works at every moment; an <b>event-driven chip</b> works only when a spike arrives. Slide the garden activity.",
        ),
      );
      eventDemo(root, life);
      root.appendChild(
        pr(
          "l18-powers-1",
          "Slide <b>Garden activity</b> down to a quiet night. What happens to the event-driven chip's work? | It falls towards zero | It stays level with the clocked chip | It climbs above the clocked chip | An event-driven chip only processes when a spike arrives. No movement, no spikes, almost no work, while the clocked chip keeps ticking.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Parallel</b>: every neuron can work at once, each doing a simple job.",
            "<b>Collocated</b> memory and processing, and <b>scalability</b> by adding chips with more neurons.",
            "<b>Event driven</b>: processing happens only when a spike arrives.",
          ],
          "Parallel, collocated, scalable, event driven.",
        ),
      );
    },
  });

  L["l18-powers"] = {
    sum: "Neuromorphic machines run all neurons in parallel with simple operations, keep processing and memory together (faster, less energy), scale by adding chips, and are event driven: they compute only when a spike arrives.",
    steps: [
      {
        t: "Everyone works at once",
        b: `<p>Picture a kitchen with one chef doing every job in turn, then a kitchen with a hundred helpers each chopping one thing at the same time.</p><p>A neuromorphic chip is the second kitchen. It runs in <b>parallel</b>: all its neurons can work <b>simultaneously</b>. Each one does something <b>simple</b>, simpler than the cores of a parallel von Neumann machine. Lots of tiny jobs at once, instead of one big queue.</p>`,
        v: F.cells(
          Array.from({ length: 12 }, (_, i) => ({ v: `n${i + 1}`, c: "teal" })),
          { label: "all at once", says: "Twelve neurons, all working at the same moment." },
        ),
        c: C(
          "What does 'parallel operation' mean for a neuromorphic chip? | All its neurons can operate at the same time | Its neurons take turns, one per clock tick | It runs two copies of the same program | Every neuron can work simultaneously, each doing a simple operation.",
        ),
      },
      {
        t: "Memory next door",
        b: `<p>Imagine cooking with the fridge in another building. Most of your evening is walking.</p><p>Hoglet's von Neumann chip lives like that. A neuromorphic chip puts <b>processing and memory together</b>, <b>collocated</b> in the synapses. Not fetching data from a distant memory makes it <b>faster</b> and uses <b>less energy</b>.</p>`,
        v: F.compare(
          { title: "von Neumann", c: "amber", body: "Processor here, memory there: every sum needs a trip." },
          { title: "Neuromorphic", c: "teal", body: "Each synapse stores and computes: no trip needed." },
        ),
      },
      {
        t: "Need more? Add chips",
        b: `<p>Lego scales nicely: want a bigger castle, add more bricks.</p><p>Neuromorphic machines are <b>scalable</b> in the same way. Need a bigger network? <b>Add more chips with more neurons</b> and connect them. The big research machines you will meet in 18.3 are built exactly like this, from many identical chips.</p>`,
        v: F.cells(["chip", "+", "chip", "+", "chip", "+", "…"], {
          says: "Chips joined one after another to make a bigger machine.",
        }),
      },
      {
        t: "Only wake when something happens",
        b: `<p>A doorbell does nothing until someone presses it. A guard who checks the door every second is tired by midnight.</p><p>A neuromorphic chip is the doorbell. It is <b>event driven</b>: processing happens <b>only when a spike arrives</b>. On a quiet night in Priya's garden, almost nothing arrives, so almost nothing is spent. Try the demo: slide the activity and compare the two chips.</p>`,
        v: (b, life) => eventDemo(b, life, { title: "Clocked against event-driven" }),
        c: C(
          "Hoglet's garden is empty for an hour. What does an event-driven chip do in that hour? | Very little, since no spikes arrive | Exactly as much as during a busy hour | More than usual, to stay ready | Processing happens when a spike arrives. No movement means no spikes, so there is almost nothing to process.",
        ),
      },
    ],
    guide: [
      "Move <b>Garden activity</b> up and down and watch the two rows.",
      "Press <b>New night</b> to roll a different night at the same activity.",
      "Answer the question after the demo.",
    ],
  };

  // ---------- 18.3 machines and their jobs (no demo) ----------
  N.register({
    id: "l18-machines",
    lecture: 18,
    order: 3,
    num: "18.3",
    title: "Real chips, real jobs",
    blurb: "What spiking hardware is good at, and the big machines built so far: SpiNNaker, TrueNorth and NorthPole.",
    render(root) {
      root.appendChild(header(this, "Applications and the neuromorphic machines built so far."));
      root.appendChild(
        takeaways(
          [
            "Jobs: <b>graph algorithms</b>, <b>optimisation</b>, <b>Markov chains</b> (random walkers) and <b>signal processing</b>.",
            "<b>SpiNNaker</b>: 18 ARM cores per chip, one monitor core plus fascicle cores; built to explore spiking networks.",
            "<b>TrueNorth</b>: a million neurons per chip, programmed in Corelet. <b>NorthPole</b> (2023): usability, low latency, efficiency.",
          ],
          "SpiNNaker explores, TrueNorth scales, NorthPole aims at real AI pipelines.",
        ),
      );
    },
  });

  L["l18-machines"] = {
    sum: "Neuromorphic hardware suits graph algorithms, optimisation, Markov-chain random walkers and signal processing. SpiNNaker (ARM cores, 1 W per chip) explores spiking networks; IBM TrueNorth packs a million neurons per chip and is configured in Corelet; NorthPole (2023) targets usable, low-latency, efficient AI.",
    steps: [
      {
        t: "Jobs that look like networks",
        b: `<p>A spiking chip <i>is</i> a network, so problems shaped like networks fit it naturally.</p><p><b>Graph algorithms</b>: routing messages through a communication network, or analysing a network's structure. <b>Optimisation</b>: integer problems such as <b>constraint satisfaction</b> and <b>QUBO</b>, and continuous ones such as optimal control and Bayesian optimisation. One study solved the LASSO problem with a spiking network (simulated on a CPU) and compared it with a conventional optimiser.</p>`,
        v: netFig(),
        c: C(
          "Why do graph problems such as network routing suit neuromorphic hardware? | The problem's nodes and links map onto neurons and synapses | Graphs need no memory at all, so any small chip will do | Routing only works when every message is coded in binary | A spiking network is itself a graph, so a network problem maps straight onto its neurons and connections.",
        ),
      },
      {
        t: "Random walkers and live signals",
        b: `<p>Picture a hedgehog wandering between flower beds, choosing the next bed by chance. That is a <b>Markov chain</b>.</p><p>On a neuromorphic chip, <b>random walkers</b> hop between neurons that stand for <b>states</b>, and the synapses are trained to copy a real-world distribution. Spiking chips also suit <b>signal processing</b>: steering autonomous vehicles, or spotting high-frequency brain oscillations to <b>detect seizures</b>.</p>`,
        v: F.flow(["Signal arrives", "Spikes", { t: "Decision", s: "steer, or raise an alarm", c: "teal" }]),
      },
      {
        t: "SpiNNaker: a machine for exploring",
        b: `<p>Some machines are built to win races, some to learn how racing works. <b>SpiNNaker</b> is the second kind.</p><p>Each chip has <b>18 ARM cores</b> sharing 128 MB of memory, and models about <b>16,000 neurons</b> with 8 million synapses <b>in real time on 1 W</b>. One core is a <b>monitor processor</b> running the operating system; the rest are <b>fascicle processors</b>, each modelling a group of up to 1,000 neurons. It cares less about accuracy than about exploring spiking networks. <b>SpiNNaker 2</b> (2019) is ten times bigger.</p>`,
        v: F.cells(
          [{ v: "M", c: "amber", sub: "monitor" }].concat(
            Array.from({ length: 17 }, (_, i) => ({ v: `F${i + 1}`, c: "teal" })),
          ),
          {
            size: 30,
            says: "One SpiNNaker chip: 18 cores, one monitor core (M) and 17 fascicle cores (F1 to F17).",
          },
        ),
        c: C(
          "On a SpiNNaker chip, what do the fascicle processors do? | Each models a group of up to 1,000 neurons | They run the operating system for the chip | They store the binary program the chip follows | One core is the monitor running the OS; the others are fascicle processors, each modelling a group of neurons.",
        ),
      },
      {
        t: "TrueNorth and NorthPole",
        b: `<p>IBM went big. A <b>TrueNorth</b> chip holds <b>1 million neurons</b> and <b>256 million synapses</b>. Each neuron has an <b>axon</b> to talk to other neurons (or itself), and chips are configured in <b>Corelet</b>, a bespoke object-oriented language.</p><p>Its successor <b>NorthPole</b> (2023) aims at <b>usability</b> in modern AI pipelines, <b>real-time, low-latency</b> work such as autonomous systems, and better <b>energy efficiency without losing accuracy</b>.</p>`,
        v: F.compare(
          { title: "TrueNorth", c: "blue", body: "1 million neurons per chip, axons, programmed in Corelet." },
          { title: "NorthPole (2023)", c: "teal", body: "Easier to use in AI pipelines, low latency, efficient." },
        ),
      },
    ],
  };
})();

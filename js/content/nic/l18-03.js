/* l18-03: Lecture 18 lessons 18.4 to 18.6: the challenges, neuromorphic cameras (demo) and metaheuristics on neuromorphic hardware (demo). Figures and demos come from l18-01.js (NIC.shared.nicL18). */
(function () {
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS,
    F = N.fig;
  const sh = NIC.shared.nicL18;
  const { C, pr, cameraDemo, unitsDemo } = sh;

  // ---------- 18.4 the catch (no demo) ----------
  N.register({
    id: "l18-catch",
    lecture: 18,
    order: 4,
    num: "18.4",
    title: "So why isn't Hoglet neuromorphic yet?",
    blurb: "Deep learning still wins, the tools are scarce, there are no shared benchmarks and programming is fiddly.",
    render(root) {
      root.appendChild(header(this, "The open challenges of neuromorphic computing."));
      root.appendChild(
        takeaways(
          [
            "Conventional machine learning still beats it on results; it wins on <b>energy efficiency</b> against edge GPUs.",
            "Hardware and software are hard to get and use, and long <b>training times</b> limit real use.",
            "No shared <b>benchmarks</b>, and programming happens at the <b>neuron and synapse level</b>, which is error prone.",
          ],
          "Promising, but not yet usable or proven.",
        ),
      );
    },
  });

  L["l18-catch"] = {
    sum: "Traditional machine learning still outperforms neuromorphic computing, though neuromorphic hardware is more energy efficient than edge GPUs. Hardware and software are hard to access, training is slow, there are no benchmark suites with a temporal aspect, and SNNs must be designed neuron by neuron.",
    steps: [
      {
        t: "Deep learning still wins",
        b: `<p>A new bike might be lighter, yet still lose the race.</p><p>So far, <b>traditional machine learning</b> is still <b>superior</b>: there are few cases where neuromorphic computing beats deep learning. Where it does win is <b>energy efficiency</b>, against hardware such as <b>edge GPUs</b>. The lecture suggests one possible reason it lags: much of the training still leans on <b>backpropagation</b>, an idea built for ordinary networks.</p>`,
        v: F.compare(
          { title: "Deep learning", c: "blue", body: "Usually better results today." },
          { title: "Neuromorphic", c: "teal", body: "Uses far less energy than edge GPUs." },
        ),
        c: C(
          "Where does neuromorphic hardware currently beat alternatives such as edge GPUs? | Energy efficiency | Accuracy on standard machine learning tasks | Ease of programming | Deep learning still wins on results in most cases, but neuromorphic hardware outperforms edge GPUs on energy efficiency.",
        ),
      },
      {
        t: "Hard to get your hands on",
        b: `<p>Priya can buy an ordinary chip for Hoglet tomorrow. A neuromorphic one? Not so easy.</p><p><b>Usability and access</b> are a real problem. There is little accessible hardware or software. Some <b>simulators</b> exist, often built for one purpose, and the large machines such as SpiNNaker were developed for specific research communities. On top of that, <b>long training times</b> hold back real-world applications.</p>`,
        v: F.flow(["Few machines", "Special-purpose simulators", { t: "Long training", c: "rose" }]),
      },
      {
        t: "No race to run in",
        b: `<p>Athletes improve faster when there is a race with a clock.</p><p>Deep learning had one: <b>benchmarks</b> and challenge problems such as the <b>ImageNet</b> competition drove its progress. Neuromorphic computing <b>lacks benchmarks</b>. Some have been proposed, but they leave out the <b>time</b> (temporal) aspect that makes spiking networks special. The field needs a suite of challenge problems, in machine learning and beyond.</p>`,
        v: F.compare(
          { title: "Deep learning", c: "blue", body: "ImageNet gave everyone the same race." },
          { title: "Neuromorphic", c: "amber", body: "No shared suite that uses timing." },
        ),
        c: C(
          "What is missing from most benchmarks proposed for neuromorphic computing so far? | The temporal aspect that spiking networks rely on | Any images or pictures of real-world scenes at all | A fair way to measure how much energy each chip uses | Proposed problems tend to ignore timing, which is exactly what characterises neuromorphic computing.",
        ),
      },
      {
        t: "Wiring it by hand",
        b: `<p>Imagine writing a letter by placing every ink molecule yourself.</p><p>That is roughly how <b>programming</b> a spiking network feels. There are few <b>programming abstractions</b>: the developer designs the network at the <b>neuron and synapse level</b>, choosing every parameter and connection. That is <b>error prone</b>. So existing examples lean on problems such as <b>graph modelling</b>, which <b>map readily</b> onto a spiking network.</p>`,
        v: F.graph({
          nodes: { a: [60, 50], b: [60, 150], c: [200, 30], d: [200, 100], e: [200, 170], f: [340, 100] },
          edges: [
            ["a", "c"],
            ["a", "d"],
            ["b", "d"],
            ["b", "e"],
            ["c", "f"],
            ["d", "f"],
            ["e", "f"],
          ],
          w: 400,
          h: 200,
          directed: true,
          label: "A small spiking network wired neuron by neuron: six neurons and seven hand-made connections.",
        }),
      },
    ],
  };

  // ---------- 18.5 the event camera (demo) ----------
  N.register({
    id: "l18-camera",
    lecture: 18,
    order: 5,
    num: "18.5",
    title: "A camera that only reports change",
    blurb:
      "Event-based cameras work like an eye: they spike when a pixel's brightness changes, and stay quiet otherwise.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "Hoglet's view as a small grid of pixels. Walk the hedgehog across and compare what a frame camera and an event camera send.",
        ),
      );
      cameraDemo(root, life);
      root.appendChild(
        pr(
          "l18-camera-1",
          "Choose <b>Event camera</b> and <b>Hedgehog sits still</b>, then press <b>Next moment</b> a few times. What does it send? | Nothing at all | The whole picture each moment | Just the hedgehog's pixels each moment | No pixel changes brightness, so no pixel spikes. A frame camera would still send every pixel.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Event-based cameras</b> (neuromorphic vision sensors) copy the eye: pixels spike when their brightness changes.",
            "They give much higher <b>temporal resolution</b> and use far <b>less power</b> than frame cameras.",
            "They can be combined with frame cameras by <b>sensor fusion</b>; frame cameras still win in some situations.",
          ],
          "Event cameras send changes, not pictures.",
        ),
      );
    },
  });

  L["l18-camera"] = {
    sum: "Neuromorphic vision sensors (event-based cameras) are modelled on the eye: each pixel emits spikes when its intensity changes. They offer far higher temporal resolution and lower power than conventional cameras, can be combined with them through sensor fusion, and conventional cameras still win in some circumstances.",
    steps: [
      {
        t: "A camera like an eye",
        b: `<p>Your eye barely notices a still room, but a fly darting past grabs you at once.</p><p>A <b>neuromorphic vision sensor</b>, or <b>event-based camera</b>, works the same way. It takes no full pictures. Each pixel <b>emits spikes</b> when its <b>brightness changes</b> over time, and stays silent otherwise. For Hoglet that is perfect: a dark, still garden costs nothing until a hedgehog wanders in.</p>`,
        v: (b, life) => cameraDemo(b, life, { title: "Walk the hedgehog" }),
        c: C(
          "What makes a pixel in an event-based camera send a spike? | Its brightness changes | The camera's clock ticks | Another pixel spikes next to it | Event cameras emit spikes based on changes in pixel intensity over time, like the eye.",
        ),
      },
      {
        t: "Faster and thriftier",
        b: `<p>A frame camera is like a friend who phones every minute to say "nothing new". An event camera only calls when there is news.</p><p>Because each pixel reports the moment it changes, event cameras have far higher <b>temporal resolution</b>: they catch very fast movement. And because quiet pixels send nothing, they use <b>greatly reduced power</b> compared with conventional cameras.</p>`,
        v: F.compare(
          { title: "Frame camera", c: "amber", body: "Every pixel, every frame, changed or not." },
          { title: "Event camera", c: "teal", body: "Only changed pixels, the moment they change." },
        ),
      },
      {
        t: "Better together",
        b: `<p>A good team mixes people with different strengths.</p><p>Event cameras do not see a still scene, and ordinary cameras give a full, familiar picture. So conventional cameras are <b>still better in some circumstances</b>. The two can be combined by <b>sensor fusion</b>: Hoglet could wake its frame camera only when the event camera spots movement, and get a proper photo of the hedgehog.</p>`,
        v: F.flow(["Event camera", "Frame camera", { t: "Sensor fusion", s: "best of both", c: "teal" }]),
        c: C(
          "Why might Hoglet keep a conventional camera alongside its event camera? | Frame cameras still do better in some situations, such as a still scene | Event cameras always use more power than frame cameras do at night | Event cameras cannot detect any movement at all in the dark garden | Each has strengths, so their outputs are combined by sensor fusion.",
        ),
      },
    ],
    guide: [
      "Press <b>Next moment</b> a few times with the <b>Event camera</b>.",
      "Switch to <b>Frame camera</b> and press it again: compare the counts.",
      "Choose <b>Hedgehog sits still</b> and try both cameras, then answer the question after the demo.",
    ],
  };

  // ---------- 18.6 metaheuristics on spiking hardware (demo) ----------
  N.register({
    id: "l18-evolve",
    lecture: 18,
    order: 6,
    num: "18.6",
    title: "Evolution on a spiking chip",
    blurb:
      "GAs and PSO are parallel and power hungry. Could they run on neuromorphic hardware? Neuromorphic heuristic units.",
    render(root, life) {
      root.appendChild(
        header(
          this,
          "A toy version of spiking heuristic units tuning one setting for Hoglet. Each unit charges at its own pace; a spike means a jump, no spike means a heuristic step.",
        ),
      );
      unitsDemo(root, life);
      root.appendChild(
        pr(
          "l18-evolve-1",
          "Press <b>Tick</b> several times and watch the <b>last move</b> column. Do the units all spike together? | No, each spikes at its own moment | Yes, all five spike on every tick | Yes, but only on every fifth tick | Each unit charges at a different rate, so spikes come at different times: the units evolve asynchronously, not in lock-step generations.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Metaheuristics (GAs, PSO) are parallel but <b>energy hungry</b> on conventional hardware.",
            "<b>Neuromorphic heuristic units</b> evolve solutions <b>asynchronously</b>, with operators as state transitions and global coordination.",
            "If a unit spikes it moves by its <b>own dynamics</b> (h_d); otherwise it takes a <b>heuristic</b> step (h_s).",
          ],
          "Spike: follow the neuron. No spike: follow the heuristic.",
        ),
      );
    },
  });

  L["l18-evolve"] = {
    sum: "Metaheuristics such as GAs and PSO are highly parallel but energy hungry on conventional hardware. Neuromorphic heuristic units evolve candidates asynchronously, embed heuristic operators in state transitions and use global coordination; a solution is perturbed by the neuron's own dynamics when it spikes and by a heuristic otherwise. Neuromorphic computing is promising but still experimental.",
    steps: [
      {
        t: "Hungry algorithms",
        b: `<p>Priya wants Hoglet to tune its own motion sensitivity, using the evolutionary algorithms from earlier lectures.</p><p><b>Metaheuristics</b> such as GAs and PSO are <b>highly parallelisable</b>: many candidates are evaluated side by side. But on conventional hardware they are <b>computationally intensive</b> and <b>energy hungry</b>. Neuromorphic chips are parallel and frugal. Could they run them?</p>`,
        v: F.cycle(["Initialise", "Generate offspring", "Evaluate offspring", "Finished?", "Selection"], {
          center: "until finished",
        }),
        c: C(
          "Why look at running metaheuristics on neuromorphic hardware? | They are parallel but energy hungry on ordinary chips | They cannot run on ordinary chips at all | They need binary data, which spikes provide | GAs and PSO are highly parallelisable but costly in energy on conventional hardware; neuromorphic chips offer parallel, low-energy computing.",
        ),
      },
      {
        t: "Neuromorphic heuristic units",
        b: `<p>Picture a choir where nobody waits for the conductor's beat: each singer comes in when ready, and a manager keeps the whole thing in tune.</p><p><b>Neuromorphic heuristic units</b> (Cruz-Duarte and Talbi, 2026) work like that. They <b>evolve candidates asynchronously</b>, with no lock-step generations. Heuristic operators are built into <b>state transitions</b>, and <b>global coordination</b> (a neighbourhood manager and a high-level selector) keeps the search on track.</p>`,
        v: F.flow([
          "Units evolve asynchronously",
          "Operators as state transitions",
          { t: "Global coordination", s: "neighbourhood manager, selector", c: "teal" },
        ]),
      },
      {
        t: "Spike, or step?",
        b: `<p>Each unit has two ways to move its candidate. If the neuron <b>spikes</b>, the candidate is perturbed by the neuron's <b>own internal dynamics</b> (called h_d). If it <b>does not spike</b>, it takes a <b>heuristic</b> perturbation instead (h_s), like a PSO or GA move. The demo is a toy version: a spike makes a big jump, and no spike means a step towards the best setting found so far.</p><details class="math-more"><summary>Show the maths</summary><p>Solutions live in a state space $B$; a transformation $T$ links a state $\\mathbf{v}$ to a position $\\mathbf{x}$ in the problem space. Each step perturbs $\\mathbf{x}_t \\to \\mathbf{v}_{t+1}$ with</p>$$\\mathbf{v}_{t+1}=\\begin{cases}h_d(\\mathbf{v}_t) & \\text{if a spike is emitted}\\\\ h_s(\\mathbf{v}_t) & \\text{otherwise}\\end{cases}$$<p>$h_d$: perturbation by the internal neuron dynamics. $h_s$: heuristic perturbation.</p></details>`,
        v: (b, life) => unitsDemo(b, life, { title: "Spike or step" }),
        c: C(
          "A unit does not spike on this tick. How is its candidate perturbed? | By the heuristic perturbation, h_s | By the neuron's internal dynamics, h_d | It is not changed until the next spike | The rule is h_d when a spike is emitted, and h_s otherwise.",
        ),
      },
      {
        t: "The future?",
        b: `<p>Early aeroplanes were costly, fragile and fascinating.</p><p>Neuromorphic computing is at that stage. It builds on <b>spiking neural networks</b>, more <b>biologically plausible</b> than deep learning. It is <b>still highly experimental</b>, a <b>promising</b> research direction with large and very expensive machines being built (SpiNNaker and SpiNNaker 2, TrueNorth, NorthPole), and still a way to go before it is <b>usable and accessible</b>. Next lecture: self-organising maps.</p>`,
        v: F.cells([
          { v: "spiking", c: "violet" },
          { v: "experimental", c: "amber" },
          { v: "promising", c: "teal" },
          { v: "not yet easy", c: "rose" },
        ]),
      },
    ],
    guide: [
      "Press <b>Tick</b> a few times and read the <b>last move</b> column.",
      "Press <b>5 ticks</b> and watch the <b>Best setting</b> and <b>Spikes so far</b>.",
      "Answer the question after the demo.",
    ],
  };
})();

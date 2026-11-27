/* Data Science (COM3021), Lecture 16: hardware–software co-design.
   This part: the lessons 16.1 (ds16-why), 16.2 (ds16-ai) and 16.3 (ds16-flows). Helpers and demos come from
   ds-l16-01.js through NIC.shared.ds16. */
(function () {
  const S = NIC.shared.ds16;
  const N = NIC;
  const { el, takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, svg, tx, tint, box, arrow } = S;
  const card = (title, tag) =>
    el(
      `<div class="card"><div class="card-head"><h2>${title}</h2><span class="tag">${tag}</span></div><div></div></div>`,
    );
  S.card = card;

  /* ---------- small static figures ---------- */
  /** A grid of cells: dense (most filled) or sparse (a few filled). */
  const grid = (x0, filled, c, name) => {
    let g = "";
    for (let r = 0; r < 6; r++)
      for (let k = 0; k < 6; k++) {
        const on = filled(r, k);
        g += `<rect x="${x0 + k * 22}" y="${14 + r * 22}" width="19" height="19" rx="4" fill="${on ? tint(c, 55) : "var(--panel-2)"}" stroke="var(--${on ? c : "line"})" stroke-width="1.5"/>`;
      }
    return g + tx(x0 + 64, 160, name, { s: 12 });
  };
  const denseSparse = () =>
    svg(
      380,
      170,
      grid(30, () => true, "blue", "Dense: a photo") +
        grid(220, (r, k) => (r * 7 + k * 3) % 11 === 0, "violet", "Sparse: who bought what"),
      "A dense tensor with every cell filled next to a sparse one with only a few",
    );
  const knives = () =>
    svg(
      520,
      120,
      box(20, 20, 220, 70, "General chip", "blue", "does everything, nothing best") +
        box(280, 20, 220, 70, "Specialised chip", "violet", "one job, very fast") +
        tx(260, 112, "a Swiss army knife and a garlic press", { s: 11, c: "var(--text-dim)", w: 700 }),
      "A general chip compared with a specialised chip",
    );
  const cloudEdge = () =>
    svg(
      520,
      130,
      box(20, 30, 150, 60, "Phone", "teal", "takes the photo") +
        box(350, 30, 150, 60, "Cloud", "blue", "runs the model") +
        arrow(172, 50, 346, 50, "amber") +
        arrow(346, 72, 172, 72, "amber") +
        tx(260, 40, "photo up", { s: 11, c: "var(--amber-ink)" }) +
        tx(260, 92, "answer back (needs signal)", { s: 11, c: "var(--amber-ink)" }) +
        tx(95, 118, "edge computing: run it here", { s: 11, c: "var(--teal-ink)" }),
      "A phone sends a photo to the cloud and waits for the answer; edge computing runs the model on the phone",
    );
  const dpu = () =>
    svg(
      520,
      150,
      box(20, 40, 150, 70, "Server CPU", "blue", "runs the apps") +
        box(210, 40, 150, 70, "DPU / IPU", "violet", "infrastructure") +
        box(400, 10, 110, 34, "Networking", "amber") +
        box(400, 58, 110, 34, "Storage", "amber") +
        box(400, 106, 110, 34, "Security", "amber") +
        arrow(172, 75, 206, 75) +
        arrow(362, 64, 396, 30) +
        arrow(362, 75, 396, 75) +
        arrow(362, 86, 396, 120),
      "An infrastructure processor next to the server CPU takes over networking, storage and security",
    );

  /* ============ 16.1 When general chips run out of puff ============ */
  reg({
    id: "ds16-why",
    order: 1,
    num: "16.1",
    title: "When one chip can't do it all",
    blurb: "Why AI is pushing hardware and software to be designed for each other.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "AI and data science workloads are pushing the limits of today's <b>general-purpose</b> hardware.",
            "A new chip is very <b>expensive</b> to design, so it needs a large demand.",
            "<b>Co-design</b>: hardware shaped by the software, and software tuned to that hardware.",
          ],
          "Make the chip and the code for each other.",
        ),
      );
    },
  });

  L["ds16-why"] = {
    sum: "Specialised workloads such as AI push general hardware to its limits. <b>Hardware–software co-design</b> specialises both to each other.",
    steps: [
      st(
        "Meet Leafly",
        `<p>Meet <b>Leafly</b>, a phone app: snap a photo of a plant and it tells you its name. Today the photo goes off to a big server, and the answer can take a few seconds.</p><p>The team wants it instant, even with no signal in the middle of a forest. That means running a neural network on a small phone chip. This lecture is about how hardware and software are designed to make that possible.</p>`,
        F.flow([
          { t: "Snap", s: "a photo of a leaf", c: "teal" },
          { t: "Recognise", s: "a neural network", c: "violet" },
          { t: "Answer", s: "“that's ivy”", c: "blue" },
        ]),
      ),
      st(
        "Swiss army knife or garlic press",
        `<p>A Swiss army knife can do almost anything, but a garlic press crushes garlic far better. Chips are the same.</p><p>Specialised applications, especially <b>AI and data science</b>, are pushing the limits of current hardware. You can run <b>specialised software on general hardware</b>, or <b>general software on specialised hardware</b>, and each choice changes the performance. And the old trick of waiting for chips to get faster (<b>Moore's law</b>) is slowing down.</p>`,
        knives(),
        mc(
          "Why can't Leafly's team simply wait for next year's phone chip to be fast enough?",
          [
            "Moore's law scaling is slowing down",
            "Phone chips cannot run neural networks",
            "New chips only arrive every ten years",
          ],
          "General chips used to get much faster every year or two. That scaling is slowing, so speed now has to come from specialising.",
        ),
      ),
      st(
        "Expensive, so it needs demand",
        `<p>Designing a new garlic press is cheap. Designing a new chip is <b>extremely expensive</b>: years of work and a factory run that costs a fortune.</p><p>So a specialised architecture only makes sense when there is a <b>large demand</b> for it. That is why the idea is <b>not new</b>, but AI and machine learning, used by billions of people every day, have recently given it a huge push.</p>`,
        F.flow([
          { t: "Big demand", s: "millions of users", c: "amber" },
          { t: "Pays for", s: "a costly new chip", c: "violet" },
          { t: "Specialised", s: "fast at one job", c: "teal" },
        ]),
      ),
      st(
        "Made for each other",
        `<p>Think of a tailor and a dancer. The tailor cuts the suit for the dancer's moves, and the dancer learns what the suit allows.</p><p>That is <b>hardware–software co-design</b>: <b>hardware</b> designed around the characteristics of the software (an algorithm, an ML model), and <b>software</b> (a library, a model) fine-tuned to make full use of that hardware, sometimes before the hardware even exists.</p>`,
        svg(
          520,
          130,
          box(30, 35, 170, 60, "Hardware", "violet", "shaped by the software") +
            box(320, 35, 170, 60, "Software", "blue", "tuned to the hardware") +
            arrow(204, 55, 316, 55, "violet") +
            arrow(316, 78, 204, 78, "blue"),
          "Hardware and software each shaped by the other",
        ),
        mc(
          "Which of these is the <b>software half</b> of co-design?",
          [
            "Tuning a model to use a chip's special units",
            "Adding a special unit to a chip for one model",
            "Buying the fastest general-purpose chip",
          ],
          "Adding a unit for a model is the hardware half. Tuning the model or library to exploit the chip is the software half. Buying a faster general chip is not co-design at all.",
        ),
      ),
    ],
  };

  /* ============ 16.2 What AI asks of a chip ============ */
  reg({
    id: "ds16-ai",
    order: 2,
    num: "16.2",
    title: "What AI asks of a chip",
    blurb: "Dense and sparse tensors, edge computing, and the new chips in cars and data centres.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "AI models run on <b>tensor operations</b>: <b>dense</b> tensors for images (CNNs), <b>sparse</b> ones for graphs and recommendations.",
            "Personal models push work from the cloud onto devices: <b>edge computing</b>.",
            "The trend reaches beyond AI: <b>ADAS</b> in cars, <b>DPUs</b> and <b>IPUs</b> in data centres.",
          ],
          "Different jobs, different chips.",
        ),
      );
    },
  });

  L["ds16-ai"] = {
    sum: "AI workloads are built from dense or sparse <b>tensor</b> operations and are moving to the <b>edge</b>; cars and data centres are getting new kinds of processor too.",
    steps: [
      st(
        "Full grids and empty ones",
        `<p>A photo is a full grid: every pixel has a value. A shop's record of who bought what is mostly empty: each customer bought only a handful of the products.</p><p>AI models are built from <b>tensor operations</b> (Lecture 14). Image models such as <b>CNNs</b> work on <b>dense</b> tensors; graph-based jobs such as <b>recommendation systems</b> work on <b>sparse</b> ones. Each needs different hardware to run well.</p>`,
        denseSparse(),
        mc(
          "Leafly adds a feature: “people who grew this also grew…”, built from which plants each user owns. What kind of tensor does it mostly use?",
          ["Sparse", "Dense", "Neither: it uses no tensors"],
          "Each user owns only a few of thousands of plants, so the user–plant table is mostly zeros: a sparse tensor, like the slides' recommendation systems. Leafly's photo network is the dense one.",
        ),
      ),
      st(
        "From the cloud to your pocket",
        `<p>Today Leafly sends the photo to the cloud and waits. No signal, no answer.</p><p>AI is part of daily life and usually runs <b>in the cloud</b>. But as models become more <b>personalised</b>, there is pressure to compute <b>on the device</b> itself. That is <b>edge computing</b>, and it needs specialised software and hardware small and frugal enough for a phone.</p>`,
        cloudEdge(),
      ),
      st(
        "Cars that watch the road",
        `<p>Leafly is not alone. A car that brakes by itself for a pedestrian has to recognise images too, in a few milliseconds, every time.</p><p>The same trend appears <b>beyond AI</b>: new classes of processing unit in <b>vehicles</b> and in <b>data centres</b>. In cars they power <b>ADAS</b> (advanced driver-assistance systems): lane keeping, emergency braking, parking help.</p>`,
        F.flow([
          { t: "Cameras", s: "and radar", c: "blue" },
          { t: "ADAS chip", s: "specialised", c: "violet" },
          { t: "Brake", s: "in milliseconds", c: "rose" },
        ]),
      ),
      st(
        "Helpers for the server",
        `<p>A busy restaurant chef should cook, not also wash up and answer the door.</p><p><b>Infrastructure processors</b> sit beside a server's CPU and take the chores: <b>networking</b> (route packets, virtual networks, balance traffic), <b>storage</b> (remote access, virtualisation) and <b>security</b> (firewall rules, encryption). They mix network hardware, programmable cores and accelerators. Names: <b>DPUs</b> (data processing units: NVIDIA BlueField, AMD Pensando) and <b>IPUs</b> (Intel IPU).</p>`,
        dpu(),
        mc(
          "Which job would a data centre hand to a DPU rather than the server's CPU?",
          ["Encrypting network traffic", "Running the customer's web app", "Training the customer's model"],
          "DPUs and IPUs take infrastructure chores: networking, storage and security such as encryption and firewall rules. The customer's own applications stay on the CPU (or GPU).",
        ),
      ),
    ],
  };

  /* ============ 16.3 Which comes first, chip or code? ============ */
  reg({
    id: "ds16-flows",
    order: 3,
    num: "16.3",
    title: "Chip first, or code first?",
    blurb: "Bottom-up, top-down, co-design and the loop that ties them together.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Design flows", "four ways");
      root.appendChild(c);
      S.flowsFig(c.lastElementChild);
      root.appendChild(
        pr(
          "ds16-flows-1",
          "A team builds a chip for one AI model while tuning the model to that chip, testing both each week. Which flow is it?",
          ["Co-design", "Top-down", "Bottom-up"],
          "Both sides are designed, analysed and optimised together, week by week: co-design. Top-down would fix the software first and then design the chip for it.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Bottom-up</b> (platform-based): hardware first, software later. Early GPU computing.",
            "<b>Top-down</b>: the workload drives new hardware. Volta tensor cores.",
            "<b>Co-design</b>: both together. Demand keeps the loop turning; neither flow is always better.",
          ],
          "Chip first, code first, or both at once.",
        ),
      );
    },
  });

  L["ds16-flows"] = {
    sum: "Hardware can come first (<b>bottom-up</b>), software can drive it (<b>top-down</b>), or both are designed together (<b>co-design</b>), in a loop driven by demand.",
    steps: [
      st(
        "Build the kitchen, then the menu",
        `<p>A chef moves into a ready-made kitchen and writes a menu that suits its ovens.</p><p>In <b>bottom-up</b> design, the <b>hardware comes first</b>, built for a general idea of how it will be used; specialised <b>software</b> is then written for it. It is also called <b>platform-based design</b>. Example: the early days of <b>general-purpose GPU</b> computing, when people bent graphics chips to do maths.</p>`,
        F.flow([
          { t: "Hardware", s: "general idea of use", c: "violet" },
          { t: "Software", s: "written to fit", c: "blue" },
        ]),
      ),
      st(
        "Write the menu, then build the kitchen",
        `<p>Now the chef writes a menu of wood-fired pizzas first, and the kitchen is built around a pizza oven.</p><p>In <b>top-down</b> design, the <b>software workload drives</b> the new hardware. Example: NVIDIA's <b>Volta tensor cores</b>, units built specifically for the tensor operations at the heart of AI.</p>`,
        F.flow([
          { t: "Software", s: "the AI workload", c: "blue" },
          { t: "Hardware", s: "built around it", c: "violet" },
        ]),
        mc(
          "Leafly's team studies its network, then asks a chip maker for a unit that runs exactly those operations. Which flow is that?",
          ["Top-down", "Bottom-up", "Platform-based"],
          "The software workload comes first and drives the hardware: top-down. Bottom-up (also called platform-based) starts from hardware that already exists.",
        ),
      ),
      st(
        "Both at once",
        `<p>Back to the tailor and the dancer: fittings every week, the suit and the dance change together.</p><p>In <b>co-design</b>, hardware and software are a <b>coupled process</b>: designed, analysed and optimised together. Example: Qualcomm's <b>Snapdragon Ride Flex</b> and <b>Ride Vision</b>, a car chip platform and its vision software. Switch between the flows to compare.</p>`,
        (b) => S.flowsFig(b),
      ),
      st(
        "Round and round",
        `<p>Phones got good cameras, so people wanted photo apps, so phones got photo chips, so apps got smarter.</p><p>Neither approach is always better, and they often <b>walk together</b>. <b>Demand</b> creates the need for more specialised software, which drives new architectures, which lead to even more specialised software. It is an <b>iterative</b> loop.</p>`,
        F.cycle([
          { t: "Demand", c: "amber" },
          { t: "Software", c: "blue" },
          { t: "Hardware", c: "violet" },
        ]),
      ),
    ],
    guide: [
      "Tap <b>Bottom-up</b>, <b>Top-down</b>, <b>Co-design</b> and <b>Iterative</b> in turn and watch which way the arrows point.",
      "Read the example under each one, then answer the question after the demo.",
    ],
  };

  S.tint = tint;
})();

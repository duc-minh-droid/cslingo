/* Data Science (COM3021), Lecture 16: hardware–software co-design.
   This part: the lessons 16.4 (ds16-partition), 16.5 (ds16-workload) and 16.6 (ds16-stack). Helpers, the Leafly
   pipeline model and the demos come from ds-l16-01.js through NIC.shared.ds16. */
(function () {
  const S = NIC.shared.ds16;
  const N = NIC;
  const { takeaways, header } = N;
  const F = N.fig,
    L = N.LESSONS;
  const { reg, mc, pr, st, mm, svg, tx, box, arrow, plan, timeline, card } = S;

  /* ============ 16.4 Deciding who does what ============ */
  reg({
    id: "ds16-partition",
    order: 4,
    num: "16.4",
    title: "Who does which job?",
    blurb: "Partitioning between hardware and software, plus the tools that test a design before it is built.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Partition Leafly", "six jobs");
      root.appendChild(c);
      S.partitionFig(c.lastElementChild);
      root.appendChild(
        pr(
          "ds16-part-1",
          "You moved <b>Pet-safety rules</b> into hardware. A vet finds a new poisonous plant next month. What now?",
          [
            "The rule is fixed in silicon until a new chip ships",
            "An ordinary app update changes the rule overnight",
            "The chip learns the new rule by itself",
          ],
          "Hardware is fast but fixed. Rules that change belong in software, where an ordinary update can fix them.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Partitioning</b> splits functions: <b>hardware</b> for speed and parallelism, <b>software</b> for flexibility and easy updates.",
            "<b>Prototyping and simulation</b> (with <b>HDLs</b>) model how the two will interact before anything is built.",
            "<b>High-level synthesis</b> turns a behaviour description into an HDL design; <b>platform-based design</b> starts from a ready platform.",
          ],
          "Fast and fixed, or flexible and slower: choose per job.",
        ),
      );
    },
  });

  L["ds16-partition"] = {
    sum: "<b>Partitioning</b> decides which functions go to hardware (speed, parallelism) and which to software (flexibility); prototyping, simulation, high-level synthesis and platform-based design help.",
    steps: [
      st(
        "Fast and fixed, or slow and flexible",
        `<p>A bread machine bakes one loaf perfectly but can't learn a new recipe. A human baker is slower but learns anything.</p><p>A crucial step in co-design is <b>partitioning</b>: deciding which functions go to <b>hardware</b> (for <b>speed and parallelism</b>) and which stay in <b>software</b> (for <b>flexibility and ease of updates</b>). Try it with Leafly's six jobs.</p>`,
        (b) => S.partitionFig(b),
        mc(
          "Which Leafly job belongs in software?",
          [
            "The plant-care tips, edited every week",
            "The network that runs on every photo",
            "Decoding the camera stream",
          ],
          "Tips change all the time, so they need easy updates: software. The network and the camera decoding are heavy, stable and run constantly: good hardware candidates.",
        ),
      ),
      st(
        "Try it before you build it",
        `<p>Architects build a scale model before pouring concrete.</p><p>Co-design leans on <b>prototyping and simulation</b>: tools that model how the hardware and software will interact before a chip exists. Engineers describe the chip in a <b>hardware description language (HDL)</b> and use ordinary software tools for the code, so they get an accurate model of the whole system.</p>`,
        F.flow([
          { t: "HDL model", s: "of the chip", c: "violet" },
          { t: "Software", s: "the real code", c: "blue" },
          { t: "Simulate", s: "together", c: "teal" },
        ]),
      ),
      st(
        "Describe it, get a design",
        `<p>You tell a satnav where you want to go, not every turn. It works out the route.</p><p><b>High-level synthesis</b> works the same way: you write a <b>high-level specification</b> of what the system should <i>do</i>, free of hardware details, and an automated process translates it into a hardware design in an <b>HDL</b>.</p>${mm("<p>A sketch of the chain: a behaviour such as <code>for each pixel: out = in × w + b</code> → the synthesis tool picks adders, multipliers, registers and a schedule → an HDL description (for example Verilog or VHDL, named here beyond the slides) → a chip or an FPGA.</p>")}`,
        F.flow([
          { t: "What it does", s: "high-level spec", c: "blue" },
          { t: "Synthesis", s: "automated", c: "amber" },
          { t: "HDL design", s: "hardware", c: "violet" },
        ]),
        mc(
          "What does high-level synthesis start from?",
          [
            "A description of the system's behaviour",
            "A finished chip that needs software",
            "A list of the chip's wires and gates",
          ],
          "It starts from a high-level description of behaviour, decoupled from hardware details, and produces the HDL design. Wires and gates are what it generates, not what it reads.",
        ),
      ),
      st(
        "Start from a kit",
        `<p>Building a house from a kit, with walls and wiring ready-made, is much faster than starting from bare land.</p><p><b>Platform-based design</b> starts from a <b>predefined platform</b>: a set of hardware and software components that already work together. You customise from there, which can <b>significantly reduce design time and complexity</b>.</p>`,
        svg(
          520,
          120,
          box(20, 30, 220, 60, "Ready platform", "blue", "hardware + software parts") +
            arrow(244, 60, 276, 60, "amber") +
            box(280, 30, 220, 60, "Leafly's product", "teal", "add your own pieces"),
          "Platform-based design customises a ready-made platform",
        ),
      ),
    ],
    guide: [
      "Tap each job to move it between <b>software</b> and <b>hardware</b>.",
      "Get the speed counter to 3/3 while the update counter stays at 3/3.",
      "Then move <b>Pet-safety rules</b> to hardware and read the warning, and answer the question after the demo.",
    ],
  };

  /* ============ 16.5 Follow the time, follow the data ============ */
  reg({
    id: "ds16-workload",
    order: 5,
    num: "16.5",
    title: "Follow the time, follow the data",
    blurb: "Profile first, watch the cost of moving data, and match each job to a CPU, GPU or specialised chip.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("Where should the network run?", "one photo");
      root.appendChild(c);
      S.moveFig(c.lastElementChild);
      root.appendChild(
        pr(
          "ds16-move-1",
          "With <b>Network on GPU</b> and a <b>4×</b> photo, you switch to <b>GPU twice as fast</b>. What happens to the time for one photo?",
          [
            "It barely changes: copying dominates",
            "It halves, like the network time",
            "It gets longer: the GPU needs more data",
          ],
          "Only the network bar shrinks. Most of the time is now spent copying the photo across, and a faster GPU does nothing about that.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "A co-design decision: find the slow function, choose a processor, <b>check the cost of moving data</b>.",
            "<b>Profile</b> on realistic inputs; note what dominates time or energy, the input size and the batch size.",
            "<b>CPU</b>: varied tasks and control flow. <b>GPU</b>: similar maths in parallel. <b>Specialised chip</b>: frequent, stable operations.",
          ],
          "Measure first, then move the work, and watch the copies.",
        ),
      );
    },
  });

  const allCpu = plan(["cpu", "cpu", "cpu"]);
  L["ds16-workload"] = {
    sum: "Start from a <b>profile</b> of the workload, remember that <b>moving data</b> can cost more than computing, and match each kind of work to the right processor.",
    steps: [
      st(
        "Find what's actually slow",
        `<p>Before you renovate a slow kitchen, watch someone cook a meal and time each part.</p><p>A co-design decision follows three moves: <b>identify the slow or costly function</b>, <b>choose a suitable processor</b>, and <b>check the cost of moving data</b>. It starts with the workload: <b>profile</b> the application on <b>realistic inputs</b>, find what dominates <b>time or energy</b>, and record the <b>input size and batch size</b>. Here is Leafly on its phone's CPU.</p>`,
        timeline(allCpu, { T: 140 }),
        mc(
          "Leafly's profile shows one photo taking 132 ms on the CPU. Which part should the team look at first?",
          ["Running the network", "Preparing the photo", "Showing the result"],
          "The network takes 120 of the 132 ms. Speeding up the small stages could never save more than a few milliseconds.",
        ),
      ),
      st(
        "The copy can cost more than the cooking",
        `<p>A faster oven in another building doesn't help if you spend ages carrying the dough there.</p><p><b>Moving data may cost more than computing on it.</b> A faster processor shrinks the compute, but the data still has to be copied across and back. So keep frequently used data <b>near the processor</b>. Try the photo size in the demo.</p>${mm("<p>Time for one photo = compute + transfer. Leafly with the network on a GPU: $8 + 12 + 15 + 1 + 4 = 40$ ms, of which $13$ ms is copying. Make the GPU twice as fast: $15 \\to 7.5$, total $32.5$ ms. Copy a photo four times as big: transfers become $4 \\times 13 = 52$ ms and dominate whatever the GPU does.</p>")}`,
        (b) => S.moveFig(b),
      ),
      st(
        "Right job, right chip",
        `<p>A kitchen has a head chef who handles anything, a line of cooks who chop in parallel, and a pasta machine that does one thing brilliantly.</p><p>Chips split the same way: a <b>CPU</b> for <b>varied tasks and control flow</b>, a <b>GPU</b> for <b>similar calculations in parallel</b>, and a <b>specialised chip</b> for <b>frequent, stable operations</b>. (Threads and GPUs were Lectures 13 to 15.)</p>`,
        svg(
          540,
          110,
          box(10, 20, 160, 66, "CPU", "blue", "varied tasks, control") +
            box(190, 20, 160, 66, "GPU", "violet", "same maths, in parallel") +
            box(370, 20, 160, 66, "Specialised chip", "teal", "frequent, stable ops"),
          "CPU, GPU and specialised chip, each with the work it suits",
        ),
        mc(
          "Leafly's network runs the same multiply-and-add on millions of numbers for every photo, and it won't change for a year. Where does it fit best?",
          ["A specialised chip", "The CPU", "Split evenly across all three"],
          "Frequent, stable operations are what specialised chips are for. A GPU would also do well; the CPU is built for varied tasks and control flow, not repetitive maths.",
        ),
      ),
    ],
    guide: [
      "Start with <b>Network on CPU</b>, then switch to <b>Network on GPU</b> and compare <b>One photo</b>.",
      "Slide <b>Photo size</b> up to 4× and watch the <b>Copying</b> lane grow.",
      "Now pick <b>GPU twice as fast</b>, and answer the question after the demo.",
    ],
  };

  /* ============ 16.6 From model to measurements ============ */
  reg({
    id: "ds16-stack",
    order: 6,
    num: "16.6",
    title: "Ship it, measure it, go round again",
    blurb: "A CPU and GPU sharing one image, the software stack, what to measure and why co-design pays off.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "Image classification: the <b>CPU</b> prepares and presents, the <b>GPU</b> runs the network, with copies between.",
            "<b>Framework</b> expresses the model, <b>compiler</b> picks hardware operations, <b>runtime</b> schedules work and memory.",
            "Measure <b>latency, throughput, energy per result</b> and <b>cost</b>; prototype, measure the whole pipeline, revisit the partition.",
          ],
          "Split it, measure it, and split it again.",
        ),
      );
    },
  });

  const gpuPlan = plan(["cpu", "gpu", "cpu"]);
  L["ds16-stack"] = {
    sum: "A real pipeline shares the work between processors; a <b>software stack</b> maps the model onto them; you <b>measure</b> the whole thing and iterate.",
    steps: [
      st(
        "One photo, two processors",
        `<p>A relay race: one runner sets off, hands the baton over for the fast middle stretch, and takes it back for the finish.</p><p>For <b>image classification</b>, the <b>CPU</b> loads and prepares the image, it is <b>copied</b> to the <b>GPU</b>, which runs the matrix-heavy network, and the result is copied back for the CPU to <b>present</b>. Leafly's photo now takes ${gpuPlan.total} ms instead of ${allCpu.total}.</p>`,
        timeline(gpuPlan, { T: 140 }),
      ),
      st(
        "Who translates the model?",
        `<p>A recipe written in English still has to become actions for a particular kitchen's ovens.</p><p>The <b>software stack</b> does that for a model. The <b>framework</b> expresses the model, the <b>compiler</b> selects <b>hardware-specific operations</b> for the chip it will run on, and the <b>runtime</b> schedules the work and the memory while it runs.</p>`,
        F.flow([
          { t: "Framework", s: "expresses the model", c: "blue" },
          { t: "Compiler", s: "picks chip operations", c: "violet" },
          { t: "Runtime", s: "schedules work, memory", c: "teal" },
        ]),
        mc(
          "Leafly moves to a phone with a new AI chip. Which layer chooses the chip's special operations for the network?",
          ["The compiler", "The framework", "The runtime"],
          "The framework describes the model the same way on any phone. The compiler maps it to hardware-specific operations; the runtime then schedules that work and its memory.",
        ),
      ),
      st(
        "Measure, then go round again",
        `<p>A recipe isn't finished until you taste the whole meal, not just one sauce.</p><p>Measure <b>end-to-end latency</b> (one answer) and <b>throughput</b> (answers per second), <b>energy per result</b>, and <b>hardware and development cost</b>. Then iterate: <b>prototype</b> before committing to new hardware, measure the <b>complete pipeline</b>, and <b>revisit the partition</b> as the bottleneck shifts.</p>`,
        F.cycle([
          { t: "Prototype", c: "blue" },
          { t: "Measure all", c: "amber" },
          { t: "Re-partition", c: "violet" },
        ]),
        mc(
          "Leafly's network got 4× faster, but the app barely feels quicker. What should the team do next?",
          [
            "Measure the whole pipeline to find the new bottleneck",
            "Make the network faster again with a newer GPU",
            "Measure the network on its own a second time",
          ],
          "When one part speeds up, the bottleneck moves (often to copying data). Measuring end to end shows where it went, so the partition can be revisited.",
        ),
      ),
      st(
        "Why bother?",
        `<p>Leafly now answers in a blink, offline, without draining the battery.</p><p>Co-design lets designers <b>explore a wider design space</b>: trade-offs between <b>power, performance, cost and development time</b>. It enables <b>optimisation at several levels</b>: system, architecture and algorithm. It matters most in <b>embedded systems</b> (tight size and power), <b>consumer electronics</b>, the <b>automotive industry</b> (autonomous driving) and <b>telecommunications</b> (5G).</p>`,
        svg(
          540,
          110,
          [
            ["Embedded", "blue"],
            ["Phones", "teal"],
            ["Cars", "violet"],
            ["5G", "amber"],
          ]
            .map(([n, c], i) => box(10 + i * 132, 24, 120, 54, n, c))
            .join("") + tx(270, 102, "where co-design pays off", { s: 11, c: "var(--text-dim)", w: 700 }),
          "Embedded systems, consumer electronics, cars and telecommunications",
        ),
      ),
    ],
  };
})();

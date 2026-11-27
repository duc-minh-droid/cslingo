/* Data Science (COM3021), Lecture 15: high-performance computing.
   This part: the lessons 15.5 (ds15-resources, cost of ownership, resource management, jobs and queues) and 15.6
   (ds15-slurm, partitions, priority scheduling, job steps and the four commands, with the job-life demo).
   Helpers come from ds-l15-01.js through NIC.shared.ds15. */
(function () {
  const S = NIC.shared.ds15;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, stats, setStats, svg, tx, tint, box, line, card, chips } = S;

  /* ---------- 15.5 figures ---------- */
  const costFig = () =>
    chips(
      [
        ["Admins", "blue", "dedicated staff"],
        ["Support", "teal", "contracts, repairs"],
        ["Power", "amber", "run the machine"],
        ["Cooling", "rose", "keep it cool"],
      ],
      "The cost of ownership: system administrators, support and maintenance, electricity for power and cooling",
    );
  const tasksFig = () =>
    N.fig.flow([
      { t: "Allocate", s: "hand out hardware", c: "blue" },
      { t: "Schedule", s: "decide who runs when", c: "teal" },
      { t: "Run and monitor", s: "launch and watch jobs", c: "amber" },
    ]);
  const typesFig = () =>
    chips(
      [
        ["Nodes", "blue"],
        ["Cores", "teal"],
        ["Interconnect", "amber"],
        ["Storage", "violet"],
        ["Accelerators", "rose"],
      ],
      "Resource types a resource manager hands out: compute nodes, processing cores, interconnect, permanent storage, accelerators",
    );
  const queueFig = () =>
    svg(
      520,
      104,
      [
        ["job 3", "violet"],
        ["job 2", "teal"],
        ["job 1", "blue"],
      ]
        .map(([n, c], i) => box(14 + i * 96, 28, 84, 44, n, c, "pending"))
        .join("") +
        line("M306 50H352", "line-2") +
        tx(329, 42, "next", { s: 10.5, c: "var(--text-dim)" }) +
        box(356, 18, 150, 64, "Cluster", "amber", "runs job 0") +
        tx(150, 96, "the queue decides the order", { s: 11, c: "var(--text-dim)" }),
      "Pending jobs wait in a queue; the cluster takes the next one when it is free",
    );

  /* ============ 15.5 Who gets the machine? ============ */
  reg({
    id: "ds15-resources",
    order: 5,
    num: "15.5",
    title: "Who gets the machine?",
    blurb: "The cost of owning a supercomputer, and the software that shares it out: resources, jobs and queues.",
    render(root) {
      root.appendChild(header(this, ""));
      root.appendChild(
        takeaways(
          [
            "<b>Cost of ownership</b>: admins, support or maintenance, and electricity to power and cool the machine.",
            "Resource managers do three jobs: <b>resource allocation</b>, <b>workload scheduling</b>, <b>distributed execution and monitoring</b>.",
            "A <b>job</b> is a self-contained unit of work; pending jobs wait in <b>queues</b> that set their order.",
          ],
          "An expensive machine must never sit idle.",
        ),
      );
    },
  });

  L["ds15-resources"] = {
    sum: "Supercomputers are costly to own, so <b>resource management</b> software allocates hardware to <b>jobs</b>, schedules them from <b>queues</b> and runs and monitors them.",
    steps: [
      st(
        "The bill nobody sees",
        `<p>Owning a big boat is more than buying it: there is the mooring, the repairs, the crew. A supercomputer is the same.</p><p>The data centre that hosts it pays <b>system administrators</b>, <b>support contracts</b> or a maintenance crew, and the <b>electricity</b> to power and cool it. Together that is the <b>cost of ownership</b>. The slides say electricity alone can cost up to $800M a year. So nobody wants Kestrel sitting idle.</p>`,
        costFig(),
      ),
      st(
        "The building manager",
        `<p>A sports centre has one booking desk: it hands out courts, keeps the timetable and checks the games run. A supercomputer has <b>resource management</b> software doing that.</p><p>It is a built-in part of the HPC software stack and does three main tasks: <b>resource allocation</b> (who gets which hardware), <b>workload scheduling</b> (who runs when), and <b>support for distributed workload execution and monitoring</b> (start the work on many nodes and keep an eye on it).</p>`,
        tasksFig(),
        mc(
          "Kestrel's software decides that Priya's job starts at 2 pm, after someone else's. Which task is that?",
          ["Workload scheduling", "Resource allocation", "Execution and monitoring"],
          "Deciding the order and timing of jobs is workload scheduling. Allocation is about which hardware a job gets; monitoring watches it while it runs.",
        ),
      ),
      st(
        "What can be handed out",
        `<p>A booking desk lends courts, rackets and changing rooms. A resource manager lends hardware, from a small slice of the machine up to the whole system, based on what each task asks for.</p><p>It recognises these <b>resource types</b>: <b>compute nodes</b>, <b>processing cores</b>, the <b>interconnect</b> (the network joining the nodes), <b>permanent storage</b>, and <b>accelerators</b> such as GPUs.</p>`,
        typesFig(),
      ),
      st(
        "Jobs and queues",
        `<p>At the post office everyone takes a ticket and waits their turn. Work on a cluster comes as <b>jobs</b>: a <b>job</b> is a self-contained unit of work with its input data, which produces output data when it runs.</p><p>A job may be <b>monolithic</b> (one piece) or split into smaller <b>steps</b>. It can run <b>interactively</b> (you watch it live) or as a <b>batch</b> (you hand it in and come back later). Pending jobs wait in <b>queues</b>, and the queue decides the order they are picked in.</p>`,
        queueFig(),
        mc(
          "Priya submits her storm run tonight and checks the forecast it wrote tomorrow morning. How was it run?",
          ["As a batch job", "As an interactive job", "As a monolithic queue"],
          "Handing work in and collecting the output later is batch processing. An interactive job is one you work with live.",
        ),
      ),
    ],
  };

  /* ---------- 15.6 figures and demo ---------- */
  /** Eight nodes split into two partitions; optional job colouring per node. */
  function partFig(use = {}, label = "Eight nodes in two partitions: six in cpu, two in gpu") {
    const node = (i) => {
      const x = 22 + i * 60,
        j = use[i];
      return `<rect x="${x}" y="38" width="50" height="44" rx="7" fill="${j ? tint(j[1], 40) : "var(--panel)"}" stroke="var(--${j ? j[1] : "line-2"})" stroke-width="2"/>${tx(x + 25, 56, `n${i + 1}`, { s: 11 })}${tx(x + 25, 72, j ? j[0] : "free", { s: 9.5, c: "var(--text-dim)", w: 700 })}`;
    };
    return svg(
      520,
      104,
      `<rect x="14" y="12" width="364" height="80" rx="10" fill="${tint("blue", 8)}" stroke="var(--blue)" stroke-dasharray="5 4"/>` +
        tx(22, 28, "partition cpu", { a: "start", s: 11.5, c: "var(--blue-ink)" }) +
        `<rect x="374" y="12" width="132" height="80" rx="10" fill="${tint("rose", 8)}" stroke="var(--rose)" stroke-dasharray="5 4"/>` +
        tx(382, 28, "partition gpu", { a: "start", s: 11.5, c: "var(--rose-ink)" }) +
        Array.from({ length: 8 }, (_, i) => node(i)).join(""),
      label,
    );
  }
  const cmdFig = () =>
    N.fig.flow([
      { t: "sbatch", s: "submit a batch job", c: "blue" },
      { t: "squeue", s: "check the queue", c: "teal" },
      { t: "srun", s: "launch parallel tasks", c: "amber" },
      { t: "sacct", s: "read the record after", c: "violet" },
    ]);

  const STAGES = [
    {
      cmd: "sbatch",
      out: "$ sbatch storm.sh\nSubmitted batch job 4021",
      use: { 0: ["job 4019", "line-2"], 1: ["job 4019", "line-2"], 2: ["job 4019", "line-2"] },
      state: "PENDING",
      cap: "Job 4021 is in the <b>cpu</b> queue. Three nodes are busy with an older job, so it waits.",
    },
    {
      cmd: "squeue",
      out: "$ squeue -u priya\nJOBID  PARTITION  NAME   ST  NODES\n4021   cpu        storm  PD  4\n\n(4019 finishes, 4021 gets nodes n1-n4)",
      use: { 0: ["4021", "blue"], 1: ["4021", "blue"], 2: ["4021", "blue"], 3: ["4021", "blue"] },
      state: "RUNNING",
      cap: "<b>squeue</b> showed it pending (PD). Once job 4019 finished, Slurm <b>allocated</b> four nodes to job 4021.",
    },
    {
      cmd: "srun",
      out: "$ srun -n 4 ./storm_model\nstep 4021.0: 4 tasks on n1-n4 ... done",
      use: { 0: ["task 0", "teal"], 1: ["task 1", "teal"], 2: ["task 2", "teal"], 3: ["task 3", "teal"] },
      state: "COMPLETED",
      cap: "Inside the allocation, <b>srun</b> launched a <b>job step</b> of four parallel tasks, one per node.",
    },
    {
      cmd: "sacct",
      out: "$ sacct -j 4021\nJobID    State      Elapsed  NNodes\n4021     COMPLETED  05:12:40 4\n4021.0   COMPLETED  05:12:31 4",
      use: {},
      state: "COMPLETED",
      cap: "<b>sacct</b> shows the record afterwards: the job and its step, both completed, and how long they took.",
    },
  ];
  /** Demo: walk one job through sbatch, squeue, srun and sacct. */
  function jobLab(b) {
    let k = 0;
    b.innerHTML = `<div class="controls" data-b>${STAGES.map((s, i) => `<button class="btn${i ? "" : " primary"}" data-i="${i}">${s.cmd}</button>`).join("")}<button class="btn ghost" data-z>Reset</button></div><div data-f></div><pre class="ds15-term" data-t></pre>${stats(
      [
        ["blue", "Job 4021"],
        ["teal", "Nodes in use"],
      ],
    )}<div class="fig-cap" data-c></div>`;
    const $ = (q) => b.querySelector(q);
    const draw = (msg) => {
      const s = k ? STAGES[k - 1] : null;
      $("[data-f]").innerHTML = partFig(s ? s.use : {}, "Kestrel's eight nodes and the jobs using them");
      $("[data-t]").textContent = s
        ? STAGES.slice(0, k)
            .map((x) => x.out)
            .join("\n\n")
        : "$ _";
      setStats(b, [s ? s.state : "not submitted", Object.keys(s ? s.use : {}).length]);
      $("[data-c]").innerHTML = msg || (s ? s.cap : "Priya's job script is ready. Press <b>sbatch</b> to submit it.");
      b.querySelectorAll("[data-i]").forEach((x) => x.classList.toggle("primary", +x.dataset.i === k));
    };
    b.querySelectorAll("[data-i]").forEach(
      (x) =>
        (x.onclick = () => {
          const i = +x.dataset.i;
          if (i === k) {
            k++;
            draw();
          } else
            draw(
              i < k
                ? `Already done. Next up: <b>${STAGES[k] ? STAGES[k].cmd : "Reset"}</b>.`
                : `Not yet: first <b>${STAGES[k].cmd}</b>.`,
            );
        }),
    );
    $("[data-z]").onclick = () => ((k = 0), draw());
    draw();
  }
  S.partFig = partFig;

  /* ============ 15.6 Queue up with Slurm ============ */
  reg({
    id: "ds15-slurm",
    order: 6,
    num: "15.6",
    title: "Queue up with Slurm",
    blurb:
      "Slurm's partitions, priority scheduling and job steps, and the four commands sbatch, squeue, srun and sacct.",
    render(root) {
      root.appendChild(header(this, ""));
      const c = card("A job's life on Kestrel", "four commands");
      root.appendChild(c);
      jobLab(c.lastElementChild);
      root.appendChild(
        pr(
          "ds15-slurm-1",
          "In the demo, which command showed job 4021 waiting with the state <b>PD</b> (pending)?",
          ["squeue", "sacct", "srun"],
          "squeue lists the jobs in the queue and their state while they wait or run. sacct is for the record afterwards; srun launches tasks.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "<b>Slurm</b>: an open-source, modular, extensible, scalable resource manager and workload scheduler.",
            "Nodes are grouped into <b>partitions</b>, which act as job queues; the highest-priority jobs get nodes first.",
            "<b>sbatch</b> submits, <b>squeue</b> checks the queue, <b>srun</b> launches parallel tasks, <b>sacct</b> shows the record.",
          ],
          "Ticket, queue, run, receipt.",
        ),
      );
    },
  });

  L["ds15-slurm"] = {
    sum: "<b>Slurm</b> manages clusters: nodes are grouped into <b>partitions</b> (job queues), the highest-priority jobs get nodes first, and <b>sbatch</b>, <b>squeue</b>, <b>srun</b> and <b>sacct</b> drive a job's life.",
    steps: [
      st(
        "Meet Slurm",
        `<p>Kestrel's booking desk has a name. The <b>Slurm Workload Manager</b> (once short for Simple Linux Utility for Resource Management) is the resource manager and <b>workload scheduler</b> on many clusters and supercomputers.</p><p>It is <b>open-source</b> (free to read and change), <b>modular</b> and <b>extensible</b> (you can plug in extra parts), and <b>scalable</b> (it copes with very large machines).</p>`,
        chips(
          [
            ["Open-source", "blue"],
            ["Modular", "teal"],
            ["Extensible", "amber"],
            ["Scalable", "violet"],
          ],
          "Slurm is open-source, modular, extensible and scalable",
        ),
      ),
      st(
        "Partitions are queues",
        `<p>A swimming pool splits its lanes: some for fast swimmers, some for lessons, each with its own rules and its own line of people waiting.</p><p>Slurm divides the nodes into logical sets called <b>partitions</b>. Each partition is a <b>job queue</b> with its own <b>constraints</b> on the jobs it takes. On Kestrel, the <b>cpu</b> partition has six ordinary nodes and the <b>gpu</b> partition two nodes with accelerators.</p>`,
        partFig(),
        mc(
          "In Slurm, what is a partition?",
          [
            "A set of nodes that acts as a job queue",
            "One task launched inside a running job",
            "The accounting record left by a finished job",
          ],
          "Partitions are logical sets of nodes, and each one is a job queue with its own constraints. A task inside a job is a job step; the record is what sacct shows.",
        ),
      ),
      st(
        "Most important first",
        `<p>At A&amp;E the most urgent patients are seen first, until every doctor is busy. Slurm's scheduler works the same way.</p><p>It gives the available nodes to the <b>highest-priority</b> jobs, one after another, until the pool of free nodes runs out; the rest wait. Inside a job, the separate tasks are called <b>job steps</b>, and each step may use all the nodes given to its job or only some of them.</p>`,
        partFig(
          {
            0: ["high", "blue"],
            1: ["high", "blue"],
            2: ["high", "blue"],
            3: ["high", "blue"],
            4: ["mid", "teal"],
            5: ["mid", "teal"],
          },
          "The high-priority job takes four cpu nodes, the next job takes the last two, and a third job must wait",
        ),
        mc(
          "The cpu partition is full and a low-priority job arrives. What happens to it?",
          [
            "It waits in the queue until nodes are free",
            "It takes nodes from the highest-priority job",
            "It runs on the gpu partition instead",
          ],
          "The scheduler hands free nodes to the highest-priority jobs until none are left; anything else stays pending in its partition's queue.",
        ),
      ),
      st(
        "Four commands",
        `<p>Like posting a parcel: you hand it in, track it, it gets delivered, you check the receipt.</p><p>With Slurm you <b>submit</b> a batch job with <b>sbatch</b>. It waits in a queue until its resources are free; you check it with <b>squeue</b>. Slurm then allocates nodes and runs it, and <b>srun</b> can launch parallel tasks inside that allocation. Afterwards, <b>sacct</b> shows the job's record. Walk Priya's storm job through all four in the demo.</p>`,
        cmdFig(),
      ),
    ],
    guide: [
      "Press <b>sbatch</b> to submit Priya's job, then <b>squeue</b> to check on it.",
      "Press <b>srun</b> to launch the parallel tasks, then <b>sacct</b> to read the record.",
      "Answer the question under the demo.",
    ],
  };
})();

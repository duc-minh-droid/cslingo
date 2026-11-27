/* Data Science Lecture 15 workshop (15.W): book time on Kestrel. Size the request with Amdahl's law, then submit
   three jobs to a small Slurm cluster, fix a job that sits in the wrong partition, and read the records. No code. */
(function () {
  const S = NIC.shared.ds15;
  const N = NIC;
  const { takeaways, header } = N;
  const L = N.LESSONS;
  const { reg, mc, pr, st, fm, seg, stats, setStats, amdahl, timeBars, partFig } = S;

  const SIZE = { cpu: 6, gpu: 2 };
  const JOBS0 = () => [
    { id: "storm", nodes: 4, pri: 3, gpu: false, part: "cpu", st: "", c: "blue" },
    { id: "plots", nodes: 3, pri: 1, gpu: false, part: "cpu", st: "", c: "teal" },
    { id: "train", nodes: 2, pri: 2, gpu: true, part: "cpu", st: "", c: "violet" },
  ];
  const ST = { "": "not sent", PD: "PD (pending)", R: "R (running)", CD: "CD (completed)" };

  function sandbox(stage, api) {
    stage.innerHTML = `<div class="card"><div class="card-head"><h2>1 · Size the request</h2><span class="tag">Amdahl's law</span></div><div class="controls" data-p></div><div class="controls" data-s></div><div data-f></div>${stats(
      [
        ["blue", "Speedup"],
        ["amber", "Best possible"],
      ],
    )}<div class="fig-cap" data-c></div></div><div class="card"><div class="card-head"><h2>2 · The Kestrel queue</h2><span class="tag">Slurm</span></div><div class="ds15-jobs" data-j></div><div class="controls"><button class="btn primary" data-tick>Tick the clock</button><button class="btn" data-acct>sacct</button><button class="btn ghost" data-z>Reset queue</button></div><div data-g></div><pre class="ds15-term" data-o></pre><div class="fig-cap" data-q></div></div>`;
    const c1 = stage.children[0],
      c2 = stage.children[1];
    const $1 = (q) => c1.querySelector(q),
      $2 = (q) => c2.querySelector(q);

    /* card 1: Amdahl */
    let p = 0.9;
    const sl = N.slider("Nodes requested", 1, 32, 1, 4);
    $1("[data-s]").append(sl);
    const draw1 = () => {
      const s = sl.value,
        sp = amdahl(p, s);
      $1("[data-f]").innerHTML = timeBars(p, s);
      setStats(c1, [`${fm(sp)}×`, `${fm(1 / (1 - p))}×`]);
      $1("[data-c]").innerHTML =
        `${Math.round(p * 100)}% of the job can be shared. On ${s} node${s > 1 ? "s" : ""} it runs <b>${fm(sp)}×</b> faster than on one.`;
      if (p === 0.9 && sp >= 5) api.done("speed");
      if (p === 0.5 && s >= 32) api.done("ceiling");
    };
    seg($1("[data-p]"), "0.5:50% shareable|0.9:90% shareable|0.99:99% shareable", "0.9", (v) => ((p = +v), draw1()));
    sl.onInput(draw1);

    /* card 2: the queue */
    let jobs = JOBS0(),
      clock = 0,
      log = "";
    const used = (part) => jobs.filter((j) => j.st === "R" && j.part === part).reduce((a, j) => a + j.nodes, 0);
    const why = (j) =>
      j.gpu && j.part === "cpu"
        ? "needs a GPU: the cpu partition has none"
        : j.nodes > SIZE[j.part]
          ? `needs ${j.nodes} nodes; this partition has ${SIZE[j.part]}`
          : "waiting for free nodes";
    const schedule = () => {
      [...jobs]
        .filter((j) => j.st === "PD")
        .sort((a, b) => b.pri - a.pri)
        .forEach((j) => {
          const fits = !(j.gpu && j.part === "cpu") && j.nodes <= SIZE[j.part] - used(j.part);
          if (fits) {
            j.st = "R";
            log += `\n[t=${clock}] ${j.id}: allocated ${j.nodes} ${j.part} nodes, running`;
          }
        });
    };
    const draw2 = (msg) => {
      $2("[data-j]").innerHTML = jobs
        .map(
          (j, i) =>
            `<div class="ds15-job"><b>${j.id}</b><small>${j.nodes} nodes · priority ${j.pri}${j.gpu ? " · needs a GPU" : ""}</small><span class="ds15-seg" data-k="${i}"></span><button class="btn" data-sb="${i}" ${j.st ? "disabled" : ""}>sbatch</button><span class="ds15-st">${ST[j.st]}${j.st === "PD" ? `: ${why(j)}` : ""}</span></div>`,
        )
        .join("");
      jobs.forEach((j, i) => {
        const host = c2.querySelector(`[data-k="${i}"]`);
        if (j.st === "R" || j.st === "CD") host.textContent = `partition ${j.part}`;
        else
          seg(host, "cpu:cpu|gpu:gpu", j.part, (v) => {
            j.part = v;
            if (j.st === "PD") schedule();
            draw2();
          });
      });
      c2.querySelectorAll("[data-sb]").forEach(
        (b) =>
          (b.onclick = () => {
            const j = jobs[+b.dataset.sb];
            j.st = "PD";
            log += `\n$ sbatch -p ${j.part} -N ${j.nodes} ${j.id}.sh`;
            schedule();
            draw2();
          }),
      );
      const use = {};
      let cpuI = 0,
        gpuI = 6;
      jobs
        .filter((j) => j.st === "R")
        .forEach((j) => {
          for (let k = 0; k < j.nodes; k++) use[j.part === "cpu" ? cpuI++ : gpuI++] = [j.id, j.c];
        });
      $2("[data-g]").innerHTML = partFig(use, "Kestrel's partitions and the jobs running on them");
      $2("[data-o]").textContent = (log || "$ _").trim();
      $2("[data-q]").innerHTML = msg || `Clock: t = ${clock}. Send each job with <b>sbatch</b>, then tick the clock.`;
      if (jobs[2].st === "R" && jobs[2].part === "gpu") api.done("gpu");
    };
    $2("[data-tick]").onclick = () => {
      clock++;
      jobs.filter((j) => j.st === "R").forEach((j) => ((j.st = "CD"), (log += `\n[t=${clock}] ${j.id}: completed`)));
      schedule();
      draw2();
    };
    $2("[data-acct]").onclick = () => {
      log +=
        "\n$ sacct\nJobID  Partition  State\n" +
        jobs
          .map(
            (j) =>
              `${j.id.padEnd(6)} ${j.part.padEnd(10)} ${j.st === "CD" ? "COMPLETED" : j.st ? ST[j.st].split(" ")[0] : "-"}`,
          )
          .join("\n");
      const all = jobs.every((j) => j.st === "CD");
      draw2(
        all
          ? "Every job shows <b>COMPLETED</b> in its record."
          : "<b>sacct</b> shows records, but not every job has completed yet. Keep ticking.",
      );
      if (all) api.done("sacct");
    };
    $2("[data-z]").onclick = () => {
      jobs = JOBS0();
      clock = 0;
      log = "";
      draw2();
    };
    draw1();
    draw2();
  }

  reg({
    id: "ds15-lab",
    order: 90,
    workshop: true,
    num: "15.W",
    title: "Workshop: book time on Kestrel",
    blurb: "No code. Size Priya's request with Amdahl's law, then get three jobs through a Slurm queue.",
    render(root, life) {
      root.appendChild(header(this, ""));
      N.workshop(root, life, {
        who: "pebble",
        intro:
          "The regatta is on Saturday. Work out how many nodes are worth asking for, then get the club's three jobs through Kestrel's queue.",
        missions: [
          {
            id: "speed",
            t: "Worth the wait",
            d: "In card 1, with <b>90% shareable</b>, raise <b>Nodes requested</b> until the <b>Speedup</b> reaches 5× or more.",
            hint: "It takes more than five nodes: the part that won't share keeps eating into the gain.",
          },
          {
            id: "ceiling",
            t: "Hit the ceiling",
            d: "Pick <b>50% shareable</b> and push <b>Nodes requested</b> all the way to 32. Notice how little you get.",
            hint: "With half the work in order, the best possible is 2×.",
          },
          {
            id: "gpu",
            t: "Right queue, right job",
            d: "In card 2 send all three jobs with <b>sbatch</b>, and get the <b>train</b> job running.",
            hint: "Read why <b>train</b> is pending. Which partition has the accelerators?",
          },
          {
            id: "sacct",
            t: "Read the receipts",
            d: "Tick the clock until every job is completed, then press <b>sacct</b>.",
            hint: "<b>plots</b> has the lowest priority: it waits until <b>storm</b> frees its nodes.",
          },
        ],
        build(stage, api) {
          sandbox(stage, api);
        },
      });
      root.appendChild(
        pr(
          "ds15-lab-1",
          "<b>storm</b> and <b>plots</b> were both sent to the cpu partition, but <b>plots</b> had to wait. Why?",
          [
            "storm's higher priority won the nodes",
            "plots was sent to the wrong partition",
            "plots needed a GPU that cpu doesn't have",
          ],
          "The scheduler gives free nodes to the highest-priority jobs until the pool runs out. storm took 4 of the 6 cpu nodes, leaving too few for plots' 3 until storm completed.",
        ),
      );
      root.appendChild(
        takeaways(
          [
            "Amdahl's law tells you when <b>more nodes stop paying off</b>: ask for what the job can use.",
            "A job sent to a <b>partition</b> without the resources it needs just waits.",
            "Higher-<b>priority</b> jobs take the free nodes first; <b>sacct</b> shows the record afterwards.",
          ],
          "Ask for the right amount, in the right queue.",
        ),
      );
    },
  });

  L["ds15-lab"] = {
    sum: "Size a request with Amdahl's law, then get three jobs through a Slurm queue: partitions, priority and the job record.",
    steps: [
      st(
        "What you will practise",
        "<p>Priya's club has three jobs for Kestrel: the storm model, the race-day plots, and training a small wind-prediction model on a GPU. First you work out how many nodes are worth asking for. Then you send the jobs to Slurm, fix the one that is stuck, and read the records.</p>",
        N.fig.flow([
          { t: "Size it", s: "Amdahl's law", c: "blue" },
          { t: "Submit", s: "sbatch", c: "teal" },
          { t: "Fix the queue", s: "right partition", c: "amber" },
          { t: "Receipts", s: "sacct", c: "violet" },
        ]),
        mc(
          "Priya's job is only 50% shareable. Is it worth asking Kestrel for 32 nodes?",
          [
            "No: the half run in order caps it below 2×",
            "Yes: 32 nodes make the run close to 32 times faster",
            "Yes: on a supercomputer, extra nodes always pay off",
          ],
          "By Amdahl's law the sequential half still takes its full time, so the speedup can never reach 2×. Those nodes would mostly sit idle.",
        ),
      ),
      st(
        "Two partitions",
        "<p>Kestrel's six ordinary nodes form the <b>cpu</b> partition and its two GPU nodes the <b>gpu</b> partition. Each partition is its own queue. A job only runs in a partition that has what it needs, and only when enough of its nodes are free.</p>",
        partFig(),
      ),
    ],
    guide: ["Work through the four missions in the workshop."],
  };
})();

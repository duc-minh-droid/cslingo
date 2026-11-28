/* Lecture 15 · High-performance computing (Data Science, COM3021): the data every scene of this video shares (VID.d15, short
   name D15). PURE: no DOM, no Math.random, no Date. Every figure comes from the lessons (js/content/ds/ds-l15-01.js,
   ds-l15-02.js, ds-l15-03.js) and is computed from its rule when the page loads, then ASSERTED against the script
   (videos/_plan/ds-15-script.md): a wrong number throws an Error. Captions are built from these values, never typed.
   Drawing pieces are in common-2.js; stickers come from the lecture 4 kit (VID.d4) and charts from VID.d9.plot.

   COLOUR ROLES OF THIS VIDEO (the same in every scene; D15.tone = D4.tone):
     "blue"    COMPUTE: cores, nodes doing sums, the shareable part of a job, running jobs
     "purple"  COMMUNICATION: the LAN, packets between nodes, wires
     "orange"  I/O and WAITING: storage, pending jobs (PD), the queue
     "red"     LIMITS: the part that must run in order, real chips lagging Moore's law, idle cores, the electricity bill
     "green"   RESULTS: total cores, the speedup reached, the ceiling line, COMPLETED, ticks
     "grey"    machines and frames: laptop, node outlines, partition frames, axes, plain labels, the older job 4019

   1. CLUSTER (s2)   D15.CL = {nodes: 4, procs: 2, cores: 8, total: 64, days: 3}
   2. FLOPS (s3)     D15.LAD = [{name: "gigaFLOPS", short: "GFLOPS", exp: 9} .. exa 18] (each rung 1000 × the last: D15.step)
                     D15.DEV = [{name, lo, hi (GFLOPS), text}] Smartphone 200–800 G .. Data-centre GPU (H100) 1000+ T
   3. NETWORK (s4)   D15.NET = {nodes: 4, hops: [[0, 1], [1, 2], [2, 3], [3, 2], [2, 1], [1, 0]]}
   4. MOORE (s5)     D15.MOORE = {years: [0, 2, 4, 6, 8], counts: [1, 2, 4, 8, 16], ten: 32}; D15.moore(y) = 2^(y / 2)
   5. AMDAHL (s6)    D15.AM = {seq: 10, par: 100, procs: 10, t1: 110, tn: 20, speedup: 5.5};  D15.amdahl(p, s)
   6. CEILING (s7)   D15.CEIL = {p90: {s8: 4.7, s64: 8.8, max: 10}, p50: {s32: 1.9, max: 2}} (one decimal, as the lesson shows)
   7. COST (s8)      D15.COST = {power: "$800M"}
   8. SLURM (s9)     D15.PART = {cpu: [0..5], gpu: [6, 7]}; D15.SCHED = run of the priority scheduler on the cpu partition:
                     {jobs: [{name: "high", n: 4, nodes: [0, 1, 2, 3]}, {name: "mid", n: 2, nodes: [4, 5]},
                             {name: "low", n: 2, nodes: null (pending)}]}
   9. COMMANDS (s10) D15.JOB = {id: 4021, n: 4, old: 4019, oldNodes: [0, 1, 2], free: 3, waits: true, nodes: [0, 1, 2, 3],
                     elapsed: "05:12:40", h: 5, min: 12}
   SMALL TOOLS  D15.same(what, got, want) throws on a mismatch;  D15.f1(v) one decimal ("4.7");  D15.seq = D4.seq. */
(function () {
  const V = window.VID;
  const D15 = (V.d15 = V.d15 || {});
  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d15: ${what} is ${JSON.stringify(got)}, the script says ${JSON.stringify(want)}`);
  };
  const f1 = (v) => String(+(+v).toFixed(1));
  Object.assign(D15, { same, f1, tone: (n) => V.d4.tone(n), seq: (...a) => V.d4.seq(...a) });

  // 1. the cluster's layers
  D15.CL = { nodes: 4, procs: 2, cores: 8, days: 3 };
  D15.CL.total = D15.CL.nodes * D15.CL.procs * D15.CL.cores;
  same("cores in the cluster", D15.CL.total, 64);

  // 2. the FLOPS ladder and the devices (GFLOPS; the slides' current figures)
  D15.LAD = [
    ["giga", 9],
    ["tera", 12],
    ["peta", 15],
    ["exa", 18],
  ].map(([w, exp]) => ({ name: `${w}FLOPS`, short: `${w[0].toUpperCase()}FLOPS`, exp }));
  D15.step = D15.LAD.slice(1).map((r, i) => 10 ** (r.exp - D15.LAD[i].exp));
  same("ladder steps", D15.step, [1000, 1000, 1000]);
  same(
    "ladder short names",
    D15.LAD.map((r) => r.short),
    ["GFLOPS", "TFLOPS", "PFLOPS", "EFLOPS"],
  );
  D15.DEV = [
    { name: "Smartphone", lo: 200, hi: 800, text: "200–800 G" },
    { name: "Laptop", lo: 100, hi: 600, text: "100–600 G" },
    { name: "Server CPU", lo: 1000, hi: 2000, text: "1–2 T" },
    { name: "Consumer GPU", lo: 20000, hi: 90000, text: "20–90 T" },
    { name: "Data-centre GPU", lo: 1000000, hi: 1000000, text: "H100: 1000+ T" },
  ];
  {
    const top = D15.DEV.reduce((b, d, i) => (d.hi > D15.DEV[b].hi ? i : b), 0);
    same("the fastest device", D15.DEV[top].name, "Data-centre GPU");
    same("server CPU in TFLOPS", [D15.DEV[2].lo / 1000, D15.DEV[2].hi / 1000], [1, 2]);
    same("H100 in TFLOPS", D15.DEV[4].lo / 1000, 1000);
  }

  // 3. the network example: border swaps between neighbours, there and back
  D15.NET = {
    nodes: 4,
    hops: [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 2],
      [2, 1],
      [1, 0],
    ],
  };

  // 4. Moore's law
  D15.moore = (y) => 2 ** (y / 2);
  D15.MOORE = { years: [0, 2, 4, 6, 8] };
  D15.MOORE.counts = D15.MOORE.years.map(D15.moore);
  D15.MOORE.ten = D15.moore(10);
  same("Moore counts", D15.MOORE.counts, [1, 2, 4, 8, 16]);
  same("Moore after ten years", D15.MOORE.ten, 32);

  // 5. Amdahl's law, the slides' example (10 sums in order, 100 shareable, 10 processors)
  D15.amdahl = (p, s) => 1 / (1 - p + p / s);
  {
    const seq = 10;
    const par = 100;
    const procs = 10;
    const t1 = seq + par;
    const tn = seq + par / procs;
    D15.AM = { seq, par, procs, t1, tn, speedup: t1 / tn };
    same("Amdahl example", [t1, tn, D15.AM.speedup], [110, 20, 5.5]);
    same("Amdahl formula on the example", f1(D15.amdahl(par / t1, procs)), "5.5");
  }

  // 6. the ceiling
  D15.CEIL = {
    p90: { s8: f1(D15.amdahl(0.9, 8)), s64: f1(D15.amdahl(0.9, 64)), max: Math.round(1 / (1 - 0.9)) },
    p50: { s32: f1(D15.amdahl(0.5, 32)), max: Math.round(1 / (1 - 0.5)) },
  };
  same("ceiling numbers", D15.CEIL, { p90: { s8: "4.7", s64: "8.8", max: 10 }, p50: { s32: "1.9", max: 2 } });

  // 7. cost of ownership
  D15.COST = { power: "$800M" };

  // 8. Slurm: partitions and a priority scheduler (highest priority first, a job needs n free nodes of its partition)
  D15.PART = { cpu: [0, 1, 2, 3, 4, 5], gpu: [6, 7] };
  D15.schedule = (jobs, part, busy = []) => {
    const free = part.filter((i) => !busy.includes(i));
    return jobs.map((j) => {
      if (j.n > free.length) return { ...j, nodes: null };
      return { ...j, nodes: free.splice(0, j.n) };
    });
  };
  D15.SCHED = {
    jobs: D15.schedule(
      [
        { name: "high", n: 4 },
        { name: "mid", n: 2 },
        { name: "low", n: 2 },
      ],
      D15.PART.cpu,
    ),
  };
  same(
    "Slurm allocation",
    D15.SCHED.jobs.map((j) => j.nodes),
    [[0, 1, 2, 3], [4, 5], null],
  );

  // 9. job 4021 through the four commands
  {
    const oldNodes = [0, 1, 2];
    const free = D15.PART.cpu.length - oldNodes.length;
    const first = D15.schedule([{ name: "4021", n: 4 }], D15.PART.cpu, oldNodes)[0];
    const after = D15.schedule([{ name: "4021", n: 4 }], D15.PART.cpu, [])[0];
    const elapsed = "05:12:40";
    const [h, min] = elapsed.split(":").map(Number);
    D15.JOB = {
      id: 4021,
      n: 4,
      old: 4019,
      oldNodes,
      free,
      waits: first.nodes === null,
      nodes: after.nodes,
      elapsed,
      h,
      min,
    };
    same("job 4021", [free, D15.JOB.waits, after.nodes, h, min], [3, true, [0, 1, 2, 3], 5, 12]);
  }
})();

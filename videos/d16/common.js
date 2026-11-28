/* Lecture 16 · Hardware–software co-design (Data Science, COM3021): the data every scene of this video shares (VID.d16, short
   name D16). PURE: no DOM, no Math.random, no Date. Drawing pieces are in common-2.js; tags, packets, wires and pictograms come
   from the lecture 4 kit VID.d4 and the timeline lanes from VID.d11 (the page loads videos/l5/common.js, videos/d4/common*.js
   and videos/d11/common*.js first). Everything below is computed when the page loads by porting the lesson's own code
   (js/content/ds/ds-l16-01.js: STAGES, COPY, plan(); the partition board's JOBS and its counters) and asserted against the
   script (videos/_plan/ds-16-script.md): a wrong number throws an Error.

   COLOUR ROLES OF THIS VIDEO (the same in every scene; D16.tone = D4.tone -> {c, ink, dim, edge, lip, on}):
     "blue"    the CPU and software (code, models, libraries, the framework)
     "purple"  the GPU and hardware (chips, silicon, the compiler that picks chip operations)
     "green"   the specialised chip (ADAS chip, DPU) and wins (a tidy partition, a met target, the co-design loop)
     "orange"  data on the move and demand (copies between processors, the photo travelling, the "Demand" box)
     "red"     problems (the slow answer, no signal, the stage that dominates the time, a rule frozen in silicon, a bottleneck)
     "grey"    frames, phone and server outlines, axes, plain labels

   1. PIPELINE (scenes 8 and 10, lesson 16.5).  D16.STAGES, D16.COPY = [20, 12, 1] and D16.plan(locs, {scale, fast}) are the
        lesson's own model: {segs: [{lane: "cpu" | "gpu" | "copy", a, b, k: "prep" | "net" | "show" | "copy", l}], total, copy}.
        D16.P = {cpu: 132 ms (all on the CPU), gpu: 40 ms (13 of it copying), fast: 32.5 ms (GPU twice as fast),
                 big: 79 ms (photo 4x as big: copies 52 ms), quarter: 28.75 ms (network a quarter, 3.75 ms: the 12 ms copy is the
                 longest bar)}, each a plan.
        D16.bars(p) -> {prep, copy1, net, copy2, show}: every stage of a plan as {a, b, row (0 CPU, 1 GPU, 2 Copying)}; a copy
             that does not happen is a zero-width bar at the point where it would be, so plans can be blended bar by bar.
   2. PARTITION (scene 7 and recap row 2, lesson 16.4).  D16.JOBS = the board's six jobs [{n, short, heavy}];
        D16.score(hw[]) -> {fast: heavy jobs in hardware, free: changing jobs left in software, frozen: changing jobs in hardware}
        D16.PART = {start: {fast 0, free 3}, tidy: {fast 3, free 3}, pet: {fast 3, free 2, frozen 1}}.
   SMALL TOOLS.  D16.fm(v, d = 1) -> "32.5" / "132";  D16.same(what, got, want) throws on a mismatch;  D16.seq = D4.seq. */
(function () {
  const V = window.VID;
  const D16 = (V.d16 = V.d16 || {});
  const same = (what, got, want) => {
    if (JSON.stringify(got) !== JSON.stringify(want))
      throw new Error(`VID.d16: ${what} is ${JSON.stringify(got)}, the script says ${JSON.stringify(want)}`);
  };
  const fm = (v, d = 1) => String(+(+v).toFixed(d));
  Object.assign(D16, { same, fm, tone: (n) => V.d4.tone(n), seq: (...a) => V.d4.seq(...a) });

  // ---------- 1. the Leafly pipeline (ds-l16-01.js, line for line) ----------
  const STAGES = [
    { k: "prep", n: "Prepare photo", t: { cpu: 8, gpu: 6 } },
    { k: "net", n: "Run network", t: { cpu: 120, gpu: 15, npu: 10 } },
    { k: "show", n: "Show result", t: { cpu: 4, gpu: 8 } },
  ];
  const COPY = [20, 12, 1];
  function plan(locs, { scale = 1, fast = 1 } = {}) {
    const segs = [];
    let t = 0;
    let where = "cpu";
    let copy = 0;
    STAGES.forEach((s, i) => {
      const p = locs[i];
      if (p !== where) {
        const c = COPY[i] * scale;
        segs.push({ lane: "copy", a: t, b: t + c, k: "copy", l: "copy" });
        t += c;
        copy += c;
        where = p;
      }
      const d = s.t[p] / (s.k === "net" && p !== "cpu" ? fast : 1);
      segs.push({ lane: p, a: t, b: t + d, k: s.k, l: s.n });
      t += d;
    });
    return { segs, total: t, copy };
  }
  const ROW = { cpu: 0, gpu: 1, copy: 2 };
  function bars(p) {
    const out = {};
    let copies = 0;
    p.segs.forEach((s, i) => {
      if (s.k === "copy") {
        copies++;
        out[`copy${copies === 1 && p.segs[i + 1].k === "net" ? 1 : 2}`] = { a: s.a, b: s.b, row: 2 };
      } else out[s.k] = { a: s.a, b: s.b, row: ROW[s.lane] };
    });
    if (!out.copy1) out.copy1 = { a: out.net.a, b: out.net.a, row: 2 };
    if (!out.copy2) out.copy2 = { a: out.net.b, b: out.net.b, row: 2 };
    return out;
  }
  const on = ["cpu", "gpu", "cpu"];
  const P = {
    cpu: plan(["cpu", "cpu", "cpu"]),
    gpu: plan(on),
    fast: plan(on, { fast: 2 }),
    big: plan(on, { scale: 4 }),
    quarter: plan(on, { fast: 4 }),
  };
  same("totals (cpu, gpu, fast, big)", [P.cpu.total, P.gpu.total, P.fast.total, P.big.total], [132, 40, 32.5, 79]);
  same("copy ms (cpu, gpu, fast, big)", [P.cpu.copy, P.gpu.copy, P.fast.copy, P.big.copy], [0, 13, 13, 52]);
  const netOf = (p) => p.segs.find((s) => s.k === "net");
  same(
    "network ms (cpu, gpu, fast)",
    [P.cpu, P.gpu, P.fast].map((p) => netOf(p).b - netOf(p).a),
    [120, 15, 7.5],
  );
  const longest = (p) => p.segs.reduce((m, s) => (s.b - s.a > m.b - m.a ? s : m));
  same(
    "network a quarter: the longest bar",
    [netOf(P.quarter).b - netOf(P.quarter).a, longest(P.quarter).k, longest(P.quarter).b - longest(P.quarter).a],
    [3.75, "copy", 12],
  );
  same(
    "big photo copies",
    P.big.segs.filter((s) => s.k === "copy").map((s) => s.b - s.a),
    [48, 4],
  );
  Object.assign(D16, { STAGES, COPY, plan, bars, P });

  // ---------- 2. the partition board (16.4 demo) ----------
  const JOBS = [
    { n: "Recognise the plant (the network)", short: "Recognise the plant", heavy: true },
    { n: "Decode the camera stream", short: "Decode the camera", heavy: true },
    { n: "Encrypt photo uploads", short: "Encrypt uploads", heavy: true },
    { n: "Menus and settings", short: "Menus and settings", heavy: false },
    { n: "Plant-care tips", short: "Plant-care tips", heavy: false },
    { n: "Pet-safety rules", short: "Pet-safety rules", heavy: false },
  ];
  const score = (hw) => ({
    fast: JOBS.filter((j, i) => j.heavy && hw[i]).length,
    free: JOBS.filter((j, i) => !j.heavy && !hw[i]).length,
    frozen: JOBS.filter((j, i) => !j.heavy && hw[i]).length,
  });
  const PART = {
    start: score([0, 0, 0, 0, 0, 0]),
    tidy: score([1, 1, 1, 0, 0, 0]),
    pet: score([1, 1, 1, 0, 0, 1]),
  };
  same("partition scores", PART, {
    start: { fast: 0, free: 3, frozen: 0 },
    tidy: { fast: 3, free: 3, frozen: 0 },
    pet: { fast: 3, free: 2, frozen: 1 },
  });
  Object.assign(D16, { JOBS, score, PART });
})();

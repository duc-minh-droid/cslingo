/* Lecture 18 · Neuromorphic computing: pure data (VID.l18, short name L18). NO DOM here.
   The app's own demo kernels (js/content/nic/l18-01.js: rng, eventDemo, cameraDemo, unitsDemo, spikeFig, netFig) are ported
   line for line, run ONCE when the page loads, and every number the script (videos/_plan/lecture-18-script.md) quotes is
   ASSERTED: a wrong figure throws a clear Error. Scenes only look values up.

   L18.same(got, want, what)      throws unless equal (numbers within 1e-9, arrays element by element)
   L18.NIGHT(act) -> {spikes: [moment numbers 1..24], n}   eventDemo, seed 7, 24 moments: act 10 -> 5 8 9 23 (4), 50 -> 11, 0 -> 0
   L18.RASTER                     spikeFig rows: neuron A 2 5 6 11, neuron B 4 9, neuron C 1 3 8 10 12 (time 0..13)
   L18.NET {nodes, edges, route}  netFig: six nodes A..F, seven edges, the lit route A B D E
   L18.CAM {GW, GH, ROW, start, walk, still}  cameraDemo: 12 x 6 pixels, hedgehog 2 pixels wide in row index 3 (row 4),
                                  starting at columns index 1, 2. walk = 3 walking moments, still = 2 still moments after them:
                                  each {pos, changed: [column indices], frame, event} with running totals (216 / 6, then 360 / 6).
   L18.UNITS {best, start: [5 settings], ticks: [[{x, v, last}] x 5] x 4}  unitsDemo, seed 11, target 7.2: U1 2.8 -> 5.2 -> 6.3
                                  -> spike 1.3 -> 4.0; the best setting so far is 7.2 throughout.
   L18.SPIN {cores, monitor, fascicle, ...} SpiNNaker / TrueNorth facts from lesson 18.2 (l18-02.js), checked for consistency. */
(function () {
  const V = window.VID;
  const L18 = (V.l18 = V.l18 || {});

  function same(got, want, what) {
    const eq = (a, b) => (typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < 1e-9 || a === b : a === b);
    const ok = Array.isArray(want)
      ? Array.isArray(got) && got.length === want.length && want.every((w, i) => eq(got[i], w))
      : eq(got, want);
    if (!ok) throw new Error(`VID.l18: ${what}: got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
  }

  // ---------- kernel (l18-01.js) ----------
  const rng = (a) => () => {
    a = (a * 1664525 + 1013904223) >>> 0;
    return a / 4294967296;
  };
  const TICKS = 24;
  function NIGHT(act, seed = 7) {
    const r = rng(seed);
    const sp = Array.from({ length: TICKS }, () => r() * 100 < act);
    const spikes = sp.flatMap((s, i) => (s ? [i + 1] : []));
    return { spikes, n: spikes.length, on: sp };
  }

  const RASTER = [
    ["neuron A", [2, 5, 6, 11]],
    ["neuron B", [4, 9]],
    ["neuron C", [1, 3, 8, 10, 12]],
  ];

  const NET = {
    nodes: { A: [50, 60], B: [160, 30], C: [160, 140], D: [280, 80], E: [390, 40], F: [390, 150] },
    edges: [
      ["A", "B"],
      ["A", "C"],
      ["B", "D"],
      ["C", "D"],
      ["D", "E"],
      ["D", "F"],
      ["C", "F"],
    ],
    route: ["A", "B", "D", "E"],
  };

  // cameraDemo: walk three moments, then sit still for two, counting both cameras together
  const CAM = (() => {
    const GW = 12,
      GH = 6,
      ROW = 3;
    const hog = (p) => [p, p + 1];
    let pos = 1;
    const sent = { frame: 0, event: 0 };
    const step = (move) => {
      const before = hog(pos);
      if (move === "move") pos = pos >= GW - 2 ? 0 : pos + 1;
      const after = hog(pos);
      const changed = before.filter((x) => !after.includes(x)).concat(after.filter((x) => !before.includes(x)));
      sent.frame += GW * GH;
      sent.event += changed.length;
      return { pos, changed, frame: sent.frame, event: sent.event };
    };
    const walk = ["move", "move", "move"].map(step);
    const still = ["still", "still"].map(step);
    return { GW, GH, ROW, start: 1, walk, still };
  })();

  // unitsDemo (a toy, not the paper's exact rules)
  const UNITS = (() => {
    const TARGET = 7.2;
    const score = (x) => Math.abs(x - TARGET);
    const RATES = [0.3, 0.45, 0.25, 0.6, 0.35];
    const r = rng(11);
    const U = RATES.map((rate, i) => ({
      id: `U${i + 1}`,
      rate,
      v: r() * 0.5,
      x: +(r() * 10).toFixed(1),
      last: "start",
    }));
    let best = U.reduce((a, u) => (score(u.x) < score(a) ? u.x : a), U[0].x);
    const snap = () => U.map((u) => ({ x: u.x, v: u.v, last: u.last }));
    const start = snap();
    const ticks = [];
    const bests = [best];
    for (let k = 0; k < 4; k++) {
      U.forEach((u) => {
        u.v += u.rate;
        if (u.v >= 1) {
          u.v = 0;
          u.x = +(r() * 10).toFixed(1);
          u.last = "spike";
        } else {
          u.x = +(u.x + 0.5 * (best - u.x) + (r() - 0.5) * 0.6).toFixed(1);
          u.x = Math.min(10, Math.max(0, u.x));
          u.last = "step";
        }
        if (score(u.x) < score(best)) best = u.x;
      });
      ticks.push(snap());
      bests.push(best);
    }
    return { TARGET, best, bests, start, ticks };
  })();

  const SPIN = { cores: 18, monitor: 1, fascicle: 17, perCore: 1000, neurons: 16000, mb: 128 };

  // ---------- asserts ----------
  same(NIGHT(10).spikes, [5, 8, 9, 23], "quiet night: spikes at moments 5 8 9 23");
  same([NIGHT(10).n, NIGHT(50).n, NIGHT(0).n], [4, 11, 0], "spike counts at 10, 50 and 0 per cent");
  same(
    NET.route.slice(1).every((b, i) => NET.edges.some((e) => e.includes(NET.route[i]) && e.includes(b))),
    true,
    "the route A B D E follows edges",
  );
  same(
    CAM.walk.map((m) => [m.frame, m.event].join("/")),
    ["72/2", "144/4", "216/6"],
    "walking: frame 72 a moment, event 2",
  );
  same(
    CAM.still.map((m) => [m.frame, m.event, m.changed.length].join("/")),
    ["288/6/0", "360/6/0"],
    "sitting still: frame 360, event stays 6",
  );
  same(CAM.GW * CAM.GH, 72, "72 pixels");
  same([UNITS.start[0].x, ...UNITS.ticks.map((s) => s[0].x)], [2.8, 5.2, 6.3, 1.3, 4], "U1's settings");
  same(
    UNITS.ticks.map((s) => s[0].last),
    ["step", "step", "spike", "step"],
    "U1 spikes at tick 3",
  );
  same(UNITS.bests, [7.2, 7.2, 7.2, 7.2, 7.2], "best so far 7.2");
  same(SPIN.monitor + SPIN.fascicle, SPIN.cores, "SpiNNaker: one monitor plus 17 fascicle cores");

  Object.assign(L18, { same, rng, NIGHT, TICKS, RASTER, NET, CAM, UNITS, SPIN });
})();

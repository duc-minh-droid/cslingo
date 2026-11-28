/* Lecture 13 (ds-13) · scene 6 (SPLIT THE PILE): twelve one-minute blocks of receipts on a four-core processor (lesson 13.3
   demo, D13.SPLIT). 1 thread takes all 12 blocks on Core 1 while three cores sit idle: 12 minutes. 2 threads take 6 each:
   6 minutes. 4 threads take 3 each: 3 minutes, speed-up 4. The clock runs at the same rate in every run (RATE seconds per
   simulated minute), so the faster finish is visible. Then the cores gather inside "One node (one computer)" over their
   "Shared memory"; "Another node" cannot see this memory (a red broken line).
   Colours: grey blocks waiting and cores; blue blocks and busy cores (alternate threads solid / light blue); red idle cores
   and the broken link; green the 3-minute finish and the speed-up; orange the shared memory.
   Story (local seconds): runs start at 0.5 / 3.6 / 6.2 (blocks take their thread colours, then fly into their cores one
   minute each and rest in a small pile under their core); 9.4-10.2 blocks and timer leave, cores glide into a 2 x 2 grid; 10.0 the node frame and shared memory;
   10.6 "Another node"; 11.0 the broken red link. Hold to 14. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, ease: E } = V;
  const S = D13.SPLIT;
  D13.same(
    "split scene: runs",
    S.runs.map((r) => [r.n, r.time]),
    [
      [1, 12],
      [2, 6],
      [4, 3],
    ],
  );

  const RATE = 0.19; // seconds per simulated minute, the same in every run
  const RUNS = S.runs.map((r, i) => {
    const t0 = [0.5, 3.6, 6.2][i];
    return { ...r, t0, go: t0 + 0.4, end: t0 + 0.4 + r.time * RATE };
  });
  const FINAL = 9.4;
  const CORE = { w: 190, h: 110, y: 250, x: (c) => 10 + c * 242 };
  const GRID = { x: (c) => 40 + (c % 2) * 220, y: (c) => 186 + Math.floor(c / 2) * 125 };
  const runAt = (t) => RUNS.filter((r) => t >= r.t0).pop();

  V.scene({
    kicker: "SPLIT THE PILE",
    title: ["Each thread takes its own part,", "but only on one node"],
    dur: 14,
    caps: [
      [0.4, 3.4, "1 thread does all 12 blocks: 12 minutes, 3 cores idle."],
      [3.6, 6.0, "2 threads, 6 blocks each: 6 minutes."],
      [6.2, 9.2, "4 threads on 4 cores, 3 blocks each: 3 minutes."],
      [9.4, 13.7, "Threads need a shared memory, so they stay on one node."],
    ],
    build(stage) {
      const node = D13.outline(stage, {
        x: 12,
        y: 116,
        w: 470,
        h: 450,
        tone: "grey",
        label: "One node (one computer)",
      });
      const shared = D13.box(stage, { x: 40, y: 446, w: 410, h: 80, tone: "orange", title: "Shared memory" });
      const cores = Array.from({ length: S.cores }, (_, c) =>
        D13.box(stage, {
          x: CORE.x(c),
          y: CORE.y,
          w: CORE.w,
          h: CORE.h,
          tone: "grey",
          title: `Core ${c + 1}`,
          sub: "-",
        }),
      );
      const blocks = D4.chips(stage, {
        x: 29,
        y: 12,
        n: S.blocks,
        w: 64,
        h: 64,
        gap: 10,
        fs: 30,
        texts: (i) => String(i + 1),
      });
      const timer = D4.tag(stage, { x: 330, y: 574, text: "", tone: "grey", solid: true, fs: 34 });
      const speed = D4.tag(stage, {
        x: 720,
        y: 574,
        text: `speed-up ${S.runs[2].speedup}`,
        tone: "green",
        solid: true,
      });
      const other = D13.box(stage, {
        x: 620,
        y: 230,
        w: 304,
        h: 200,
        tone: "grey",
        title: "Another node",
        sub: "cannot see this memory",
        fs: 32,
      });
      const svg = V.l5.svg(stage);
      const link = [
        [482, 544],
        [576, 620],
      ].map(([a, b]) => D13.seg(svg, { a: { x: a, y: 330 }, b: { x: b, y: 330 }, tone: "red", dash: "12 10", w: 6 }));
      const cross = svg.appendChild(V.l5.cross(560, 330, 36, "red", { w: 8 }));

      return (t) => {
        const fin = ramp(t, FINAL, FINAL + 0.8, E.inOut);
        const gone = 1 - ramp(t, FINAL, FINAL + 0.4, E.lin);
        const run = runAt(t);
        const sim = run ? Math.max(0, Math.min(run.time, (t - run.go) / RATE)) : 0;

        // the blocks: each waits in the top row in its thread's colour, then flies into its core during its own minute
        blocks.all((j) => {
          if (!run) return { o: 0 };
          const k0 = ramp(t, run.t0, run.t0 + 0.3, E.lin);
          const th = run.owner[j];
          const kb = Math.max(0, Math.min(1, sim - run.slot[j]));
          const from = blocks.mid(j);
          const q = run.slot[j];
          const to = { x: CORE.x(th) + 35 + (q % 4) * 40, y: CORE.y + CORE.h + 32 + Math.floor(q / 4) * 40 };
          const kk = E.inOut(kb);
          return {
            x: (to.x - from.x) * kk,
            y: (to.y - from.y) * kk,
            s: 1 - 0.55 * kk,
            text: kb > 0.3 ? "" : String(j + 1),
            tone: k0 > 0.5 ? "blue" : "grey",
            solid: k0 > 0.5 && th % 2 === 0,
            o: gone * Math.min(1, ramp(t, 0.3, 0.6, E.lin)),
          };
        });

        cores.forEach((c, i) => {
          const busy = run && i < run.n;
          const working = busy && sim < run.time && t >= run.go;
          const tone = !run ? "grey" : busy ? "blue" : "red";
          const fl = run ? flash(t, run.t0, run.t0 + 0.4) : 0;
          c.set({
            k: ramp(t, 0.2 + 0.08 * i, 0.5 + 0.08 * i, E.lin),
            tone,
            solid: !!working,
            sub: !run ? "" : busy ? `thread ${i + 1}` : "idle",
            s: 1 + 0.06 * fl,
            dash: tone === "red",
            x: (GRID.x(i) - CORE.x(i)) * fin,
            y: (GRID.y(i) - CORE.y) * fin,
          });
        });

        // the clock: same rate in every run
        if (run) {
          const doneRun = sim >= run.time;
          const m = doneRun ? run.time : Math.floor(sim);
          const last = run.n === S.cores;
          timer.set({
            k: ramp(t, run.t0, run.t0 + 0.2, E.lin),
            text: `${run.n} thread${run.n > 1 ? "s" : ""}: ${m} minute${m === 1 ? "" : "s"}`,
            tone: doneRun && last ? "green" : "grey",
            s: 1 + 0.1 * flash(t, run.end, run.end + 0.4),
            o: gone,
          });
        } else timer.set({ k: 0 });
        speed.set({ k: ramp(t, RUNS[2].end + 0.2, RUNS[2].end + 0.5, E.lin), o: gone });

        // one node with its shared memory, and another node that cannot see it
        node.set({ k: ramp(t, 10.0, 10.4, E.lin) });
        shared.set({ k: ramp(t, 10.1, 10.5, E.lin) });
        other.set({ k: ramp(t, 10.6, 11.0, E.lin) });
        const kl = ramp(t, 11.0, 11.4, E.out);
        link.forEach((l) => l.set({ k: kl }));
        V.l5.drawOn(cross, ramp(t, 11.3, 11.6, E.out));
      };
    },
  });
})();

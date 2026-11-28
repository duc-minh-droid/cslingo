/* Lecture 15 (ds-15) · scene 9 (SLURM): Slurm is Kestrel's resource manager; nodes n1..n8 are split into partitions (cpu: 6,
   gpu: 2, D15.PART), each a job queue; free nodes go to the highest-priority job first (D15.SCHED: high takes n1-n4, mid
   n5-n6, low waits: PD).
   Story (local seconds): 0.3 the grey Slurm badge, 0.9 its four tags (stagger 0.25); 3.2 eight free node boxes (stagger 0.08),
   3.9 the two dashed partition frames; 6.4 three job cards below; 6.7-7.5 'high' flies into n1-n4 (they turn blue 'high'),
   7.8-8.6 'mid' into n5-n6; 9.6-10.4 'low' moves up, bounces off the full cpu frame, turns orange with the PD tag. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const { ramp, flash, ease: E } = V;
  const P = D15.PART;
  const J = D15.SCHED.jobs;

  const NX = (i) => (i < 6 ? 34 + i * 104 : 700 + (i - 6) * 104);
  const NY = 262;
  const owner = (i) => J.find((j) => j.nodes && j.nodes.includes(i));

  V.scene({
    kicker: "SLURM",
    title: ["Partitions are queues,", "most important first"],
    dur: 13,
    caps: [
      [0.4, 3.0, "Slurm: Kestrel's resource manager and scheduler."],
      [3.2, 6.2, `Partitions: cpu has ${P.cpu.length} nodes, gpu has ${P.gpu.length}. Each is a queue.`],
      [6.4, 9.4, `The high-priority job takes ${J[0].n} nodes, the next takes ${J[1].n}.`],
      [9.6, 12.6, "No nodes left: the third job waits."],
    ],
    build(stage) {
      const badge = D15.box(stage, { x: 318, y: 8, w: 300, h: 76, title: "Slurm", tone: "grey", solid: true, fs: 40 });
      const TAGS = ["open-source", "modular", "extensible", "scalable"];
      const tx = [130, 360, 580, 800];
      const tags = TAGS.map((s, i) => D4.tag(stage, { x: tx[i], y: 134, text: s, tone: "grey" }));
      const fCpu = D15.frame(stage, { x: 20, y: 222, w: 640, h: 176, label: "partition cpu" });
      const fGpu = D15.frame(stage, { x: 686, y: 222, w: 230, h: 176, label: "partition gpu" });
      const nodes = [...P.cpu, ...P.gpu].map((i) =>
        D15.box(stage, { x: NX(i), y: NY, w: 92, h: 110, title: `n${i + 1}`, sub: "free", r: 16 }),
      );
      const JX = [20, 200, 380];
      const jobs = J.map((j, i) =>
        D15.box(stage, { x: JX[i], y: 470, w: 160, h: 110, title: j.name, sub: `${j.n} nodes`, tone: "blue", fs: 32 }),
      );
      const pd = D4.tag(stage, { x: 720, y: 525, text: "PD: waiting for free nodes", tone: "orange", solid: true });
      const FLY = [
        [6.7, 7.5],
        [7.8, 8.6],
      ];
      // where a job card flies: over the middle of its nodes
      const target = (j) => {
        const a = NX(j.nodes[0]);
        const b = NX(j.nodes[j.nodes.length - 1]) + 92;
        return { x: (a + b) / 2 - 80, y: NY };
      };

      return (t) => {
        badge.set({ k: ramp(t, 0.3, 0.7) });
        tags.forEach((g, i) => g.set({ k: D15.seq(t, 0.9, 0.25, 0.35, i) }));
        fCpu.set({ k: ramp(t, 3.9, 4.3) });
        fGpu.set({ k: ramp(t, 4.2, 4.6) });
        nodes.forEach((n, i) => {
          const j = owner(i);
          const ji = j ? J.indexOf(j) : -1;
          const got = ji >= 0 && t >= FLY[ji][1];
          n.set({
            k: D15.seq(t, 3.2, 0.08, 0.35, i),
            tone: got ? "blue" : "grey",
            solid: got,
            sub: got ? j.name : "free",
            s: 1 + 0.08 * (ji >= 0 ? flash(t, FLY[ji][1], FLY[ji][1] + 0.35) : 0),
          });
        });
        jobs.forEach((c, i) => {
          const k = D15.seq(t, 6.4, 0.12, 0.35, i);
          if (i < 2) {
            const [a, b] = FLY[i];
            const f = ramp(t, a, b, E.inOut);
            const to = target(J[i]);
            c.set({
              k,
              x: (to.x - JX[i]) * f,
              y: (to.y - 470) * f,
              o: 1 - ramp(t, b - 0.15, b, E.lin),
              s: 1 - 0.2 * f,
            });
            return;
          }
          const bounce = Math.sin(Math.PI * ramp(t, 9.6, 10.4, E.lin));
          const late = t >= 10.2;
          c.set({
            k,
            y: -70 * bounce,
            tone: late ? "orange" : "blue",
            solid: late,
            sub: late ? "pending" : `${J[i].n} nodes`,
          });
        });
        pd.set({ k: ramp(t, 10.4, 10.8) });
      };
    },
  });
})();

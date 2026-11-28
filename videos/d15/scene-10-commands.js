/* Lecture 15 (ds-15) · scene 10 (FOUR COMMANDS): Priya's job 4021 through sbatch, squeue, srun and sacct (D15.JOB, the
   lesson's demo output). Left: a terminal that types; right: the cpu partition n1..n6 and the job's status tag.
   Story (local seconds): 0.4 '$ sbatch storm.sh' / 'Submitted batch job 4021'; n1-n3 grey 'job 4019'; status PENDING (orange);
   3.6 '$ squeue -u priya' and its table, PD highlighted orange; 5.6 n1-n3 clear (4019 finishes), 6.2 n1-n4 turn blue '4021',
   status RUNNING (blue); 7.6 '$ srun -n 4 ./storm_model', the step line; 9.0 the nodes relabel 'task 0' .. 'task 3' and pulse
   together, 9.8 '... done'; 11.0 '$ sacct -j 4021' and the record; 12.2 the nodes clear and the status turns green COMPLETED
   with a tick. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;
  const J = D15.JOB;
  const id = String(J.id);
  const range = `n${J.nodes[0] + 1}-n${J.nodes[J.nodes.length - 1] + 1}`;

  // [text, start, end of typing, tone]
  const LINES = [
    ["$ sbatch storm.sh", 0.4, 1.1],
    [`Submitted batch job ${id}`, 1.3, 1.7, "grey"],
    ["$ squeue -u priya", 3.6, 4.2],
    ["JOBID PARTITION NAME  ST NODES", 4.3, 4.6, "grey"],
    [`${id}  cpu       storm PD ${J.n}`, 4.7, 5.0, "grey"],
    [`$ srun -n ${J.n} ./storm_model`, 7.6, 8.3],
    [`step ${id}.0: ${J.n} tasks`, 8.5, 8.9, "grey"],
    [`on ${range} ... done`, 9.8, 10.2, "grey"],
    [`$ sacct -j ${id}`, 11.0, 11.5],
    ["JobID State     Elapsed  NNodes", 11.6, 11.9, "grey"],
    [`${id}  COMPLETED ${J.elapsed} ${J.n}`, 12.0, 12.3, "grey"],
  ];
  D15.same("table columns line up", [LINES[3][0].indexOf("ST"), LINES[4][0].indexOf("PD")], [22, 22]);
  D15.same("sacct columns line up", [LINES[9][0].indexOf("Elapsed"), LINES[10][0].indexOf(J.elapsed)], [16, 16]);

  V.scene({
    kicker: "FOUR COMMANDS",
    title: ["Submit, check,", "run, read the record"],
    dur: 15,
    caps: [
      [0.4, 3.4, `sbatch submits job ${id}. Nodes are busy, so it waits.`],
      [3.6, 7.3, `squeue shows it pending, PD. Then it gets ${range.replace("-", " to ")}.`],
      [7.6, 10.7, `srun launches a job step: ${J.n} tasks, one per node.`],
      [11.0, 14.6, `sacct shows the record: completed in ${J.h} h ${J.min} min.`],
    ],
    build(stage) {
      const term = D15.term(stage, { x: 12, y: 12, w: 570, h: 540, n: LINES.length });
      const frame = D15.frame(stage, { x: 600, y: 40, w: 324, h: 450, label: "partition cpu" });
      const nodes = D15.PART.cpu.map((i) =>
        D15.box(stage, {
          x: 616 + (i % 2) * 152,
          y: 76 + Math.floor(i / 2) * 136,
          w: 140,
          h: 116,
          title: `n${i + 1}`,
          sub: "free",
          r: 16,
        }),
      );
      const status = D4.tag(stage, { x: 716, y: 560, text: "", tone: "orange", solid: true });
      const tsvg = D4.svg(stage);
      const tick = tsvg.appendChild(L5.tick(892, 560, 44, "green"));

      return (t) => {
        term.set({
          k: ramp(t, 0.1, 0.4),
          lines: LINES.map(([text, a, b, tone]) => ({ text, k: ramp(t, a, b, E.lin), tone: tone || "" })),
          hi: [{ line: 4, from: 22, to: 24, tone: "orange", k: ramp(t, 5.0, 5.3) }],
        });
        frame.set({ k: ramp(t, 0.2, 0.6) });
        const running = t >= 6.2 && t < 12.4;
        const tasks = t >= 9.0;
        const pulse = flash(t, 9.0, 9.4) + flash(t, 9.5, 9.9);
        nodes.forEach((n, i) => {
          const old = J.oldNodes.includes(i) && t < 5.6;
          const mine = J.nodes.includes(i) && running && t >= 6.2 + 0.1 * i;
          n.set({
            k: D15.seq(t, 0.3, 0.06, 0.35, i),
            tone: mine ? "blue" : "grey",
            solid: mine || old,
            sub: mine ? (tasks ? `task ${i}` : id) : old ? `job ${J.old}` : "free",
            s: 1 + (mine ? 0.08 * pulse : 0) + 0.06 * (old ? 0 : flash(t, 5.6, 5.9) * +J.oldNodes.includes(i)),
          });
        });
        const st = t >= 12.4 ? ["COMPLETED", "green"] : t >= 6.2 ? ["RUNNING", "blue"] : ["PENDING", "orange"];
        status.set({
          k: ramp(t, 1.5, 1.9),
          text: `${id}: ${st[0]}`,
          tone: st[1],
          s: 1 + 0.08 * (flash(t, 6.2, 6.6) + flash(t, 12.4, 12.8)),
        });
        L5.drawOn(tick, ramp(t, 12.6, 13.0));
      };
    },
  });
})();

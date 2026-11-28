/* Lecture 15 (ds-15) · scene 8 (WHO GETS THE MACHINE): owning a supercomputer costs admins, support, power and cooling
   (electricity up to $800M a year, D15.COST); a resource manager allocates hardware, schedules the work, starts it and
   monitors it; jobs wait in a queue that sets the order.
   Story (local seconds): 0.3 four grey cost chips (stagger 0.15), 1.4 the red electricity tag over Power and Cooling;
   3.4 they slide away; the grey 'Resource manager' desk and three steps: the first two light blue at 3.6 and 4.6, the third at
   6.8 while three node boxes below it blink blue; 9.6 the flow lifts away; the queue: job 3, job 2, job 1 (orange, pending),
   a 'next' arrow and the blue Cluster running job 0; 11.0 job 0 is done (green tag), job 1 slides into the Cluster, the
   others move up one place. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const L5 = V.l5;
  const { ramp, flash, ease: E } = V;

  V.scene({
    kicker: "WHO GETS THE MACHINE",
    title: ["A costly machine", "must never sit idle"],
    dur: 13,
    caps: [
      [0.4, 3.2, "Owning it costs admins, support, power and cooling."],
      [3.4, 6.6, "A resource manager allocates hardware and schedules the work."],
      [6.8, 9.4, "It starts the work on many nodes and monitors it."],
      [9.6, 12.6, "Each job waits in a queue that sets the order."],
    ],
    build(stage) {
      // ---- costs ----
      const COST = [
        ["Admins", "dedicated staff"],
        ["Support", "contracts, repairs"],
        ["Power", ""],
        ["Cooling", ""],
      ].map(([a, b], i) => D15.box(stage, { x: 18 + i * 228, y: 230, w: 216, h: 170, title: a, sub: b, wrap: true }));
      const bill = D4.tag(stage, {
        x: 18 + 2 * 228 + 216 + 6,
        y: 160,
        text: `electricity: up to ${D15.COST.power} a year`,
        tone: "red",
        solid: true,
      });

      // ---- the resource manager ----
      const gF = V.h("div", {
        style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
      });
      stage.append(gF);
      const desk = D15.box(gF, { x: 298, y: 12, w: 340, h: 90, title: "Resource manager", tone: "grey", solid: true });
      const STEP = [
        ["Resource allocation", "which hardware"],
        ["Workload scheduling", "who runs when"],
        ["Execution and monitoring", "start it, watch it"],
      ];
      const steps = STEP.map(([a, b], i) =>
        D15.box(gF, { x: 12 + i * 316, y: 150, w: 280, h: 160, title: a, sub: b, tone: "blue", fs: 28, wrap: true }),
      );
      steps.forEach((s) => s.el.querySelectorAll("div").forEach((d) => (d.style.whiteSpace = "normal")));
      const fsvg = D4.svg(gF);
      const arr = [0, 1].map((i) =>
        fsvg.appendChild(L5.arrow(296 + i * 316, 230, 324 + i * 316, 230, "grey", 1, { w: 5, head: 14 })),
      );
      const nodes = [0, 1, 2].map((i) =>
        D15.box(gF, { x: 660 + i * 88, y: 370, w: 72, h: 80, title: "", tone: "blue", r: 14 }),
      );
      const LIT = [3.6, 4.6, 6.8];

      // ---- the queue ----
      const SLOT = (i) => 12 + i * 160; // slot 0 (left) .. 2 (front of the queue)
      const jobs = [3, 2, 1].map((n, i) =>
        D15.box(stage, {
          x: SLOT(i),
          y: 280,
          w: 140,
          h: 130,
          title: `job ${n}`,
          sub: "pending",
          tone: "orange",
          solid: true,
          fs: 30,
        }),
      );
      const qsvg = D4.svg(stage);
      const nextA = qsvg.appendChild(L5.arrow(496, 345, 640, 345, "orange", 1, { w: 6, head: 18 }));
      const nextT = D4.label(stage, { x: 568, y: 300, text: "next", tone: "orange", fs: 28 });
      const cl = D15.box(stage, {
        x: 660,
        y: 240,
        w: 264,
        h: 210,
        title: "Cluster",
        sub: "runs job 0",
        tone: "blue",
        solid: true,
        fs: 34,
      });
      const done = D4.tag(stage, { x: 792, y: 510, text: "job 0: done", tone: "green", solid: true });

      return (t) => {
        const away = ramp(t, 3.3, 3.8, E.inOut);
        COST.forEach((c, i) => c.set({ k: D15.seq(t, 0.3, 0.15, 0.4, i), y: -60 * away, o: 1 - away }));
        bill.set({ k: ramp(t, 1.4, 1.8), y: -60 * away, o: 1 - away, s: 1 + 0.08 * flash(t, 1.8, 2.2) });

        const lift = ramp(t, 9.5, 10.0, E.inOut);
        V.place(gF, { y: -40 * lift, o: 1 - lift });
        V.show(gF, t >= 3.4 && lift < 1 ? 1 - lift : 0);
        desk.set({ k: ramp(t, 3.4, 3.8) });
        steps.forEach((s, i) =>
          s.set({
            k: ramp(t, 3.5 + 0.15 * i, 3.9 + 0.15 * i),
            solid: t >= LIT[i],
            s: 1 + 0.08 * flash(t, LIT[i], LIT[i] + 0.4),
          }),
        );
        arr.forEach((a, i) => L5.drawOn(a, ramp(t, 3.8 + 0.2 * i, 4.2 + 0.2 * i)));
        nodes.forEach((n, i) => {
          const blink = t >= 6.9 && Math.sin((t - 6.9) * 7 + i * 2) > 0;
          n.set({ k: ramp(t, 6.8 + 0.1 * i, 7.1 + 0.1 * i), solid: blink });
        });

        // queue
        const kq = ramp(t, 9.8, 10.2);
        const mv = ramp(t, 11.0, 11.8, E.inOut);
        jobs.forEach((j, i) => {
          const front = i === 2;
          j.set({
            k: ramp(t, 9.8 + 0.1 * i, 10.2 + 0.1 * i),
            x: front ? 400 * mv : 160 * mv,
            o: front ? 1 - ramp(t, 11.5, 11.8, E.lin) : 1,
          });
        });
        L5.drawOn(nextA, kq);
        nextT.set({ k: kq });
        cl.set({
          k: ramp(t, 9.9, 10.3),
          sub: t >= 11.7 ? "runs job 1" : "runs job 0",
          s: 1 + 0.06 * flash(t, 11.7, 12.1),
        });
        done.set({ k: ramp(t, 11.0, 11.3) });
      };
    },
  });
})();

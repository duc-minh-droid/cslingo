/* Lecture 12 (ds-12) · scene 10 (KUBERNETES): a control plane and worker nodes keep the desired state: a crashed pod is restarted,
   the pod of a failed node is rescheduled (lesson 12.6; D12.K8S: desired 3, running 3, 2, 3, 2, 3 over the story).
   Story (local seconds): 0.5 the purple "Control plane" (the brain: schedules, heals, scales); 1.0 three grey worker nodes.
   2.6 the purple tag "Deployment: replicas 3", the counter "Desired 3 · Running 3" and three green pods P1, P2, P3, one per node;
   3.6 the purple "Service: one stable address" bar; grey request dots flow from it to the running pods. 6.0 P2 flashes red and
   vanishes (Running 2, the counter turns red); 6.8 a new P2 pops on node 2 with a purple ring, tag "restarted". 8.8 node 2 turns
   red and dashed, tag "down" under it (Running 2); 9.6-10.4 its pod slides along a purple arrow to node 3, lands green, tag
   "rescheduled" (Running 3). 12.0 four purple chips: Horizontal scaling, Self-healing, Declarative (YAML), Cloud-native. */
(function () {
  const V = window.VID;
  const D12 = V.d12;
  const D4 = V.d4;
  const L5 = V.l5;
  const { ramp, flash, lerp, ease: E } = V;

  const K = D12.K8S;
  const NX = [12, 323, 634];
  const NW = 290;
  const PY = 378;
  const cx = (i) => NX[i] + NW / 2;
  const T = {
    cp: 0.5,
    nodes: 1.0,
    pods: 2.6,
    svc: 3.6,
    crash: 6.0,
    restart: 6.8,
    down: 8.8,
    move: [9.6, 10.4],
    why: 12.0,
  };
  const WHY = [
    ["Horizontal scaling", "Self-healing"],
    ["Declarative (YAML)", "Cloud-native"],
  ];

  V.scene({
    kicker: "KUBERNETES",
    title: ["Say what you want,", "the cluster keeps it that way"],
    dur: 15,
    caps: [
      [0.4, 2.4, "A cluster: a control plane and worker nodes."],
      [2.6, 5.8, `A Deployment wants ${K.desired} pods; a Service gives them one address.`],
      [6.0, 8.6, "A pod crashes: it is restarted."],
      [8.8, 11.8, `Node 2 goes down: its pod is rescheduled. Still ${K.running(11)} running.`],
      [12.0, 14.7, "Scaling, self-healing, declarative, cloud-native."],
    ],
    build(stage) {
      const cp = D12.box(stage, {
        x: 168,
        y: 12,
        w: 600,
        h: 100,
        text: "Control plane",
        sub: "the brain: schedules, heals, scales",
        tone: "purple",
      });
      const dep = D4.tag(stage, {
        x: 230,
        y: 152,
        text: `Deployment: replicas ${K.desired}`,
        tone: "purple",
        solid: true,
      });
      const count = D4.tag(stage, { x: 712, y: 152, text: "", tone: "grey", solid: true });
      const svc = D12.box(stage, {
        x: 12,
        y: 192,
        w: 912,
        h: 52,
        text: "Service: one stable address",
        tone: "purple",
        fs: 28,
      });
      const nodes = NX.map((x) => D12.box(stage, { x, y: 270, w: NW, h: 222, text: "" }));
      const names = NX.map((x, i) => D4.label(stage, { x: x + NW / 2, y: 458, text: `Worker node ${i + 1}`, fs: 30 }));
      const svg = D4.svg(stage);
      const ring = svg.appendChild(
        V.s("circle", { cx: cx(1), cy: PY, r: 54, fill: "none", stroke: D12.tone("purple").c, "stroke-width": 7 }),
      );
      const arrow = svg.appendChild(L5.arrow(cx(1) + 40, PY - 70, cx(2) + 40, PY - 70, "purple", 1, { bow: -24 }));
      const dots = Array.from({ length: 9 }, () =>
        svg.appendChild(V.s("circle", { r: 11, fill: D12.tone("grey").lip })),
      );
      const pods = ["P1", "P2", "P3"].map((p) =>
        D4.disc(stage, { x: 0, y: 0, size: 84, text: p, tone: "green", fs: 34 }),
      );
      const notes = [
        D4.tag(stage, { x: cx(1), y: 538, text: "restarted", tone: "purple" }),
        D4.tag(stage, { x: cx(1), y: 538, text: "down", tone: "red", solid: true }),
        D4.tag(stage, { x: cx(2), y: 538, text: "rescheduled", tone: "purple" }),
      ];
      const why = WHY.flatMap((row, r) =>
        row.map((text, i) => D4.tag(stage, { x: i ? 660 : 276, y: 536 + r * 64, text, tone: "purple", solid: true })),
      );

      return (t) => {
        cp.set({ k: ramp(t, T.cp, T.cp + 0.4, E.lin) });
        const down = ramp(t, T.down, T.down + 0.4, E.lin);
        nodes.forEach((n, i) => {
          const isDown = i === 1 && t >= T.down;
          n.set({
            k: ramp(t, T.nodes + 0.2 * i, T.nodes + 0.4 + 0.2 * i, E.lin),
            tone: isDown ? "red" : "grey",
            dash: isDown,
          });
          names[i].set({ k: ramp(t, T.nodes + 0.2 * i, T.nodes + 0.4 + 0.2 * i), tone: isDown ? "red" : "grey" });
        });
        dep.set({ k: ramp(t, T.pods, T.pods + 0.4, E.lin) });
        const n = K.running(t);
        count.set({
          k: ramp(t, T.pods + 0.3, T.pods + 0.7, E.lin),
          text: `Desired ${K.desired} · Running ${n}`,
          tone: n < K.desired ? "red" : "grey",
        });
        svc.set({ k: ramp(t, T.svc, T.svc + 0.4, E.lin) });

        // pods: P1 on node 1, P2 on node 2 (crash, restart, then moves to node 3), P3 on node 3 (makes room)
        const kMove = ramp(t, T.move[0], T.move[1], E.inOut);
        const p3x = cx(2) - 56 * ramp(t, T.move[0], T.move[0] + 0.4, E.inOut);
        const p2 = D4.at({ x: cx(1), y: PY }, { x: cx(2) + 56, y: PY }, kMove, -70);
        const crashed = t >= T.crash && t < T.restart;
        const p2k =
          t < T.crash
            ? ramp(t, T.pods + 0.2, T.pods + 0.6, E.lin)
            : crashed
              ? 1 - ramp(t, T.crash + 0.3, T.crash + 0.6, E.lin)
              : ramp(t, T.restart, T.restart + 0.4, E.lin);
        pods[0].set({ k: ramp(t, T.pods, T.pods + 0.4, E.lin), x: cx(0), y: PY });
        pods[1].set({
          k: p2k,
          x: p2.x,
          y: p2.y,
          tone: crashed || (t >= T.down && kMove < 1) ? "red" : "green",
          s: 1 + 0.2 * flash(t, T.crash, T.crash + 0.3),
        });
        pods[2].set({ k: ramp(t, T.pods + 0.4, T.pods + 0.8, E.lin), x: p3x, y: PY });
        V.show(ring, ramp(t, T.restart + 0.2, T.restart + 0.5) * (1 - down));
        const gone = 1 - ramp(t, T.why - 0.3, T.why, E.lin);
        notes[0].set({ k: ramp(t, T.restart + 0.3, T.restart + 0.7, E.lin), o: 1 - down });
        notes[1].set({ k: ramp(t, T.down + 0.2, T.down + 0.6, E.lin), o: gone });
        L5.drawOn(arrow, ramp(t, T.move[0] - 0.3, T.move[0] + 0.3));
        notes[2].set({ k: ramp(t, T.move[1], T.move[1] + 0.4, E.lin), o: gone });

        // request dots: Service -> each running pod, three per pod, on a 1.8 s loop
        const targets = [
          { x: cx(0), on: true },
          { x: p2.x, on: t >= T.restart + 0.4 && !(t >= T.down && kMove < 1) },
          { x: p3x, on: true },
        ];
        dots.forEach((d, j) => {
          const pod = j % 3;
          const tg = targets[pod];
          const s = T.svc + 0.5 + 0.6 * Math.floor(j / 3) + 0.2 * pod;
          const u = t < s ? -1 : ((t - s) % 1.8) / 0.8;
          const on = tg.on && t < T.why && u >= 0 && u <= 1;
          d.setAttribute("cx", tg.x.toFixed(1));
          d.setAttribute("cy", lerp(250, PY - 46, Math.max(0, u)).toFixed(1));
          V.show(d, on ? 1 : 0);
        });
        why.forEach((c, i) => c.set({ k: D12.seq(t, T.why, 0.3, 0.4, i) }));
      };
    },
  });
})();

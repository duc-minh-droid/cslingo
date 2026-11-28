/* Lecture 15 (ds-15) · scene 2 (WHAT MAKES IT FAST): Priya's storm model takes 3 days on her laptop; a system is fast through
   processing, communication and I/O; one big machine or many on a network (Kestrel); a cluster holds nodes, nodes hold
   processors, processors hold cores: 4 × 2 × 8 = 64 (D15.CL).
   Story (local seconds): 0.3 the laptop and the red 3-day bar; 3.0 the laptop shrinks up, three chips pop (stagger 0.2);
   6.5 non-distributed against distributed (Kestrel); 9.9 cluster -> node -> processor, the 8 cores fill one by one;
   12.6 the counter types and 64 cores turns green. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D15 = V.d15;
  const { ramp, flash, ease: E } = V;
  const C = D15.CL;
  const T = D15.tone;

  const SUM = `${C.nodes} nodes × ${C.procs} processors × ${C.cores} cores =`;
  V.scene({
    kicker: "WHAT MAKES IT FAST",
    title: ["Three days on a laptop,", "so borrow a cluster"],
    dur: 15,
    caps: [
      [0.4, 2.8, `On a laptop, the storm model takes ${C.days} days.`],
      [3.0, 6.2, "Three things make a system fast: processing, communication, I/O."],
      [6.5, 9.6, "One giant machine, or many computers on a network."],
      [9.9, 12.4, "A cluster has nodes; nodes hold processors; processors hold cores."],
      [12.6, 14.7, `${C.nodes} × ${C.procs} × ${C.cores} = ${C.total} cores working at once.`],
    ],
    build(stage) {
      const group = () => {
        const g = V.h("div", {
          style: { position: "absolute", left: "0px", top: "0px", width: "936px", height: "640px" },
        });
        stage.append(g);
        return g;
      };
      // ---- A: the laptop and the 3-day bar ----
      const gLap = group();
      gLap.style.transformOrigin = "40px 100px";
      const lap = D15.box(gLap, { x: 40, y: 100, w: 300, h: 240, title: "Priya's laptop" });
      lap.el.style.justifyContent = "flex-end";
      lap.el.style.paddingBottom = "22px";
      const lsvg = D4.svg(gLap);
      const G = T("grey");
      lsvg.append(
        V.s("rect", {
          x: 130,
          y: 128,
          width: 120,
          height: 78,
          rx: 8,
          fill: "var(--panel-2)",
          stroke: G.lip,
          "stroke-width": 5,
        }),
        V.s("path", {
          d: "M112 214H268L256 230H124Z",
          fill: G.c,
          stroke: G.lip,
          "stroke-width": 4,
          "stroke-linejoin": "round",
        }),
      );
      const gBar = group();
      const bar = D4.bar(gBar, { x: 384, y: 200, w: 520, h: 44, tone: "red" });
      const barLab = D4.label(gBar, { x: 644, y: 160, text: `storm model: ${C.days} days`, tone: "red", fs: 32 });
      const due = D4.tag(gBar, { x: 644, y: 300, text: "regatta: Saturday", tone: "grey", solid: true });

      // ---- B: three chips ----
      const gB = group();
      const CH = [
        ["Processing", "doing the sums", "blue"],
        ["Communication", "moving data", "purple"],
        ["I/O", "reading, writing", "orange"],
      ].map(([t, s, tone], i) =>
        D15.box(gB, { x: 12 + i * 312, y: 330, w: 288, h: 170, title: t, sub: s, tone, fs: 34 }),
      );

      // ---- C: one big machine or many ----
      const gC = group();
      const left = D15.box(gC, { x: 24, y: 12, w: 430, h: 500, title: "" });
      const right = D15.box(gC, { x: 482, y: 12, w: 430, h: 500, title: "" });
      const lt = D4.label(gC, { x: 239, y: 62, text: "Non-distributed", fs: 34, tone: "grey" });
      const rt = D4.label(gC, { x: 697, y: 62, text: "Distributed", fs: 34, tone: "grey" });
      lt.el.firstChild.style.color = "var(--ink)";
      rt.el.firstChild.style.color = "var(--ink)";
      const big = D15.box(gC, { x: 109, y: 112, w: 260, h: 220, title: "", tone: "grey", solid: true });
      const ls = D15.box(gC, {
        x: 44,
        y: 370,
        w: 390,
        h: 110,
        title: "one big machine,",
        sub: "shared memory",
        fs: 28,
      });
      ls.el.style.border = "none";
      const wires = D4.svg(gC);
      const SM = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 532 + (i % 3) * 120, y: 122 + Math.floor(i / 3) * 120 }));
      const net = [];
      for (let i = 0; i < 6; i++)
        for (const j of [i + 1, i + 3])
          if (j < 6 && !(i % 3 === 2 && j === i + 1))
            net.push(
              D4.wire(wires, { pts: [SM[i], SM[j]].map((p) => ({ x: p.x + 45, y: p.y + 40 })), tone: "purple" }),
            );
      const small = SM.map((p) =>
        D15.box(gC, { x: p.x, y: p.y, w: 90, h: 80, title: "", tone: "blue", solid: true, r: 16 }),
      );
      const rs = D15.box(gC, { x: 502, y: 370, w: 390, h: 110, title: "many computers,", sub: "one network", fs: 28 });
      rs.el.style.border = "none";
      const kes = D4.tag(gC, { x: 697, y: 560, text: "Kestrel", tone: "grey", solid: true, fs: 30 });

      // ---- D: cluster -> node -> processor ----
      const gD = group();
      const zl = D4.svg(gD);
      const fCl = D15.frame(gD, { x: 12, y: 40, w: 300, h: 360, label: "Cluster: many nodes" });
      const fNo = D15.frame(gD, { x: 336, y: 40, w: 280, h: 360, label: "Node: 2 processors" });
      const fPr = D15.frame(gD, { x: 640, y: 40, w: 284, h: 360, label: "Processor: cores" });
      const nodes = [0, 1, 2, 3].map((i) =>
        D15.box(gD, { x: 42 + (i % 2) * 130, y: 96 + Math.floor(i / 2) * 150, w: 110, h: 120, title: "node", r: 18 }),
      );
      const cpus = [0, 1].map((i) =>
        D15.box(gD, { x: 376, y: 100 + i * 150, w: 200, h: 110, title: "CPU", tone: "blue", solid: true }),
      );
      const cores = D15.cells(gD, { x: 664, y: 166, n: C.cores, cols: 4, size: 52, gap: 10 });
      const zoom = (a, b, c) =>
        [b, c].map((p) =>
          zl.appendChild(
            V.s("line", {
              x1: a.x,
              y1: a.y,
              x2: p.x,
              y2: p.y,
              stroke: G.c,
              "stroke-width": 4,
              "stroke-dasharray": "10 8",
            }),
          ),
        );
      const z1 = zoom({ x: 282, y: 156 }, { x: 336, y: 60 }, { x: 336, y: 380 });
      const z2 = zoom({ x: 576, y: 155 }, { x: 640, y: 60 }, { x: 640, y: 380 });
      const sum = D4.label(gD, { x: 12, y: 500, text: "", tone: "grey", fs: 36, anchor: "l" });
      sum.el.firstChild.style.color = "var(--ink)";
      const total = D4.tag(gD, { x: 826, y: 500, text: `${C.total} cores`, tone: "green", solid: true, fs: 36 });

      return (t) => {
        // A
        const kA = ramp(t, 0.3, 0.7);
        const up = ramp(t, 3.0, 3.6, E.inOut);
        const outB = 1 - ramp(t, 6.3, 6.6, E.lin);
        V.place(gLap, { y: -80 * up, s: 1 - 0.35 * up, o: outB });
        lap.set({ k: kA });
        V.show(lsvg, kA);
        const barOut = 1 - ramp(t, 3.0, 3.3, E.lin);
        V.show(gBar, barOut);
        bar.set({ k: ramp(t, 0.6, 2.4, E.inOut) });
        barLab.set({ k: ramp(t, 0.5, 0.8) });
        due.set({ k: ramp(t, 1.8, 2.2), s: 1 + 0.1 * flash(t, 2.4, 2.8) });
        // B
        V.show(gB, outB);
        CH.forEach((c, i) => c.set({ k: D15.seq(t, 3.2, 0.2, 0.4, i) }));
        // C
        const kC = ramp(t, 6.5, 6.9) * (1 - ramp(t, 9.6, 9.9, E.lin));
        V.show(gC, kC > 0 ? 1 : 0);
        left.set({ k: kC });
        right.set({ k: ramp(t, 6.7, 7.1) * (kC > 0 ? 1 : 0) });
        lt.set({ k: kC });
        rt.set({ k: ramp(t, 6.7, 7.1) });
        big.set({ k: ramp(t, 6.8, 7.2) });
        ls.set({ k: ramp(t, 7.2, 7.6) });
        small.forEach((b, i) => b.set({ k: D15.seq(t, 7.4, 0.1, 0.4, i) }));
        net.forEach((w) => w.set({ k: ramp(t, 8.0, 8.5, E.out) }));
        rs.set({ k: ramp(t, 8.4, 8.8) });
        kes.set({ k: ramp(t, 8.9, 9.2), s: 1 + 0.12 * flash(t, 9.1, 9.5) });
        // D
        const on = t >= 9.8 ? 1 : 0;
        V.show(gD, on);
        fCl.set({ k: ramp(t, 9.9, 10.3) });
        nodes.forEach((b, i) => b.set({ k: D15.seq(t, 10.0, 0.1, 0.4, i), ring: i === 1 && t >= 10.6 ? "blue" : "" }));
        const k2 = ramp(t, 10.6, 11.0);
        z1.forEach((l) => V.show(l, k2));
        fNo.set({ k: k2 });
        cpus.forEach((b, i) => b.set({ k: D15.seq(t, 10.8, 0.15, 0.4, i), ring: i === 0 && t >= 11.3 ? "blue" : "" }));
        const k3 = ramp(t, 11.3, 11.7);
        z2.forEach((l) => V.show(l, k3));
        fPr.set({ k: k3 });
        cores.set((i) => ({ k: D15.seq(t, 11.5, 0.12, 0.3, i) }));
        sum.set({ k: ramp(t, 12.6, 12.8), text: V.type(SUM, ramp(t, 12.6, 13.4, E.lin)) });
        total.set({ k: ramp(t, 13.5, 13.9), s: 1 + 0.12 * flash(t, 13.9, 14.3) });
      };
    },
  });
})();

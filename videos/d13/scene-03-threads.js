/* Lecture 13 (ds-13) · scene 3 (PROCESSES OR THREADS): process-level parallelism gives every process its own processor
   time and its own memory, and spawning one is expensive; thread-level parallelism starts several threads inside one
   process, each on its own core of a multi-core processor, all sharing the process's memory (lesson 13.1).
   Colours: purple processes, grey processors and cores, orange memory, blue threads, red the start-up cost, green cheaper.
   Story (local seconds): 0.5 / 0.8 / 1.1 the three process rows build (process, wire, processor chip, wire, memory);
   2.6 red price tags pulse on the processes, 2.8 "expensive to spawn"; 5.4 the right half: "One process" outline,
   5.7 / 6.0 / 6.3 the three thread lines draw, 6.4 the multi-core processor and its cores, 6.6 wires thread -> core;
   7.4 "One shared memory" and the wires from every core to it; 10.0 the green "cheaper: nothing new to set up" and the
   multi-core frame pulses. Hold to 13. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, ease: E } = V;

  const ROWS = [90, 210, 330];
  const RH = 90;
  const TX = [562, 700, 838]; // thread x positions on the right
  const WAVE = { y0: 140, y1: 262 };
  const CORE_Y = 400;
  const MEM = { x: 520, y: 486, w: 360, h: 70 };

  V.scene({
    kicker: "PROCESSES OR THREADS",
    title: ["Separate kitchens,", "or one kitchen with many cooks"],
    dur: 13,
    caps: [
      [0.4, 2.4, "Process-level: each process has its own memory."],
      [2.6, 5.2, "Spawning a new process every time is expensive."],
      [5.4, 7.2, "Thread-level: one process starts several threads."],
      [7.4, 9.8, "Each runs on its own core; all share one memory."],
      [10.0, 12.7, "The model built for multi-core processors."],
    ],
    build(stage) {
      // ----- left: process-level -----
      const leftHead = D4.label(stage, { x: 220, y: 30, text: "Process-level", tone: "purple", fs: 32 });
      const svgL = V.l5.svg(stage);
      const rows = ROWS.map((y, i) => {
        const proc = D13.box(stage, { x: 0, y, w: 172, h: RH, tone: "purple", title: `Process ${i + 1}`, fs: 28 });
        const w1 = D13.seg(svgL, { a: { x: 172, y: y + RH / 2 }, b: { x: 218, y: y + RH / 2 } });
        const chip = svgL.appendChild(D13.chip(250, y + RH / 2, 62));
        const w2 = D13.seg(svgL, { a: { x: 282, y: y + RH / 2 }, b: { x: 288, y: y + RH / 2 } });
        const mem = D13.box(stage, {
          x: 288,
          y,
          w: 158,
          h: RH,
          tone: "orange",
          title: "Memory",
          sub: "own copy",
          fs: 28,
        });
        return { proc, w1, chip, w2, mem };
      });
      const svgTag = V.l5.svg(stage);
      const tags = ROWS.map((y) => svgTag.appendChild(D13.priceTag(150, y + 4, 56)));
      const expensive = D4.tag(stage, { x: 220, y: 470, text: "expensive to spawn", tone: "red", solid: true });

      // ----- right: thread-level -----
      const rightHead = D4.label(stage, { x: 700, y: 22, text: "Thread-level", tone: "blue", fs: 32 });
      const proc = D13.outline(stage, {
        x: 476,
        y: 50,
        w: 448,
        h: 240,
        tone: "purple",
        label: "One process",
        fill: true,
      });
      const multi = D13.outline(stage, { x: 476, y: 316, w: 448, h: 124, tone: "grey", label: "multi-core processor" });
      const svgR = V.l5.svg(stage);
      const threads = TX.map((x) => D13.wavy(svgR, { x, y0: WAVE.y0, y1: WAVE.y1, amp: 12, waves: 2 }));
      const tLabels = TX.map((x, i) => D4.label(stage, { x, y: 112, text: `Thread ${i + 1}`, tone: "blue", fs: 28 }));
      const toCore = TX.map((x) => D13.seg(svgR, { a: { x, y: WAVE.y1 + 6 }, b: { x, y: CORE_Y - 30 } }));
      const toMem = TX.map((x) =>
        D13.seg(svgR, { a: { x, y: CORE_Y + 30 }, b: { x: MEM.x + MEM.w / 2 + (x - 700) * 0.4, y: MEM.y } }),
      );
      const cores = TX.map((x) => svgR.appendChild(D13.chip(x, CORE_Y, 54)));
      const mem = D13.box(stage, { ...MEM, tone: "orange", title: "One shared memory", fs: 30 });
      const cheaper = D4.tag(stage, {
        x: 700,
        y: 602,
        text: "cheaper: nothing new to set up",
        tone: "green",
        solid: true,
      });

      const pop = (g, k) => V.place(g, { s: 0.7 + 0.3 * E.pop(k), o: Math.min(1, k * 4) });
      return (t) => {
        leftHead.set({ k: ramp(t, 0.3, 0.7, E.lin) });
        rows.forEach((r, i) => {
          const t0 = 0.5 + 0.3 * i;
          r.proc.set({ k: ramp(t, t0, t0 + 0.4, E.lin) });
          r.w1.set({ k: ramp(t, t0 + 0.2, t0 + 0.4, E.lin) });
          pop(r.chip, ramp(t, t0 + 0.3, t0 + 0.6, E.lin));
          r.w2.set({ k: ramp(t, t0 + 0.4, t0 + 0.5, E.lin) });
          r.mem.set({ k: ramp(t, t0 + 0.45, t0 + 0.85, E.lin) });
          const kt = ramp(t, 2.6 + 0.2 * i, 2.9 + 0.2 * i, E.lin);
          const beat = t > 3.2 ? 0.08 * Math.max(0, Math.sin(2 * Math.PI * (t - 3.2 - 0.2 * i) * 0.9)) : 0;
          V.place(tags[i], { s: (0.6 + 0.4 * E.pop(kt)) * (1 + beat), o: Math.min(1, kt * 4) });
        });
        expensive.set({ k: ramp(t, 2.8, 3.2, E.lin) });

        const kR = ramp(t, 5.4, 5.8, E.lin);
        rightHead.set({ k: kR });
        proc.set({ k: kR });
        threads.forEach((th, i) => th.set({ k: ramp(t, 5.7 + 0.3 * i, 6.2 + 0.3 * i, E.inOut) }));
        tLabels.forEach((l, i) => l.set({ k: ramp(t, 5.7 + 0.3 * i, 6.0 + 0.3 * i, E.lin) }));
        const pulse = flash(t, 10.0, 10.6);
        multi.set({ k: ramp(t, 6.4, 6.8, E.lin), bw: 4 + 4 * pulse });
        cores.forEach((c, i) => pop(c, ramp(t, 6.5 + 0.1 * i, 6.8 + 0.1 * i, E.lin)));
        toCore.forEach((w, i) => w.set({ k: ramp(t, 6.6 + 0.1 * i, 7.0 + 0.1 * i, E.out) }));
        mem.set({ k: ramp(t, 7.4, 7.8, E.lin) });
        toMem.forEach((w) => w.set({ k: ramp(t, 7.6, 8.2, E.out), tone: "orange" }));
        cheaper.set({ k: ramp(t, 10.0, 10.4, E.lin) });
      };
    },
  });
})();

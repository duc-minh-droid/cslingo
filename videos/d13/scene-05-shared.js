/* Lecture 13 (ds-13) · scene 5 (SHARED MEMORY): a thread is a stream of execution spawned by a process; the threads of one
   process share its memory (a global variable, an open file), so every thread, even one started later, can see the parent
   process's data, and nothing has to be copied or sent first (lesson 13.3).
   Colours: purple the process outline, blue the three thread lines and their dots, orange the shared data, grey dashed
   access lines, green the tick, grey crossed-out envelope.
   Story (local seconds): 0.3 the process frame; 0.5 / 0.8 / 1.1 the three thread lines draw and their dots start running,
   each at its own pace; 3.4 "total = 0" and "receipts.csv"; 4.0 dashed lines from every thread to both; 6.4 Thread 3 is
   marked "started later" and its line redraws; 7.0-7.6 its dot runs down to total; 7.6 total rings green and a tick pops;
   8.6 the crossed-out envelope and "nothing copied, nothing sent". Hold to 11. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, lerp, ease: E } = V;

  const TX = [220, 450, 680];
  const W = { y0: 112, y1: 250 };
  const SPEED = [0.55, 0.4, 0.7]; // laps per second: each thread follows its own path at its own pace
  const START = [0.5, 0.8, 1.1];
  const LATE = 6.4;
  const BOX = { y: 330, w: 280, h: 112, total: 300, file: 640 };

  V.scene({
    kicker: "SHARED MEMORY",
    title: ["Threads share the worktop", "of their process"],
    dur: 11,
    caps: [
      [0.4, 3.2, "A thread: a stream of execution spawned by a process."],
      [3.4, 6.2, "Threads share memory: global variables and open files."],
      [6.4, 8.4, "Every thread can see the parent process's data."],
      [8.6, 10.7, "Nothing has to be copied or sent first."],
    ],
    build(stage) {
      const proc = D13.outline(stage, {
        x: 12,
        y: 12,
        w: 912,
        h: 460,
        tone: "purple",
        label: "Crumb's tally program (one process)",
        fill: true,
      });
      const svg = V.l5.svg(stage);
      const access = TX.flatMap((x) =>
        [BOX.total, BOX.file].map((bx) =>
          D13.seg(svg, { a: { x, y: W.y1 + 8 }, b: { x: bx, y: BOX.y }, dash: "10 10", w: 4 }),
        ),
      );
      const shade = ["c", "lip", "edge"];
      const threads = TX.map((x, i) => D13.wavy(svg, { x, y0: W.y0, y1: W.y1, amp: 14, waves: 2, shade: shade[i] }));
      const labels = TX.map((x, i) => D4.label(stage, { x, y: 82, text: `Thread ${i + 1}`, tone: "blue", fs: 28 }));
      const total = D13.box(stage, {
        x: BOX.total - BOX.w / 2,
        y: BOX.y,
        w: BOX.w,
        h: BOX.h,
        tone: "orange",
        title: "total = 0",
        sub: "global variable",
      });
      const file = D13.box(stage, {
        x: BOX.file - BOX.w / 2,
        y: BOX.y,
        w: BOX.w,
        h: BOX.h,
        tone: "orange",
        title: "receipts.csv",
        sub: "open file",
      });
      const svgTop = V.l5.svg(stage);
      const dots = TX.map(() => D13.mark(svgTop, { tone: "blue", r: 12 }));
      const runner = D13.mark(svgTop, { tone: "blue", r: 13 });
      const tick = svgTop.appendChild(V.l5.tick(BOX.total + BOX.w / 2 - 6, BOX.y + 4, 54, "green", { w: 10 }));
      const late = D4.tag(stage, { x: 708, y: 180, text: "started later", tone: "blue", solid: true, anchor: "l" });
      const env = svgTop.appendChild(D13.noSend(300, 556, 84));
      const nothing = D4.tag(stage, {
        x: 372,
        y: 556,
        text: "nothing copied, nothing sent",
        tone: "grey",
        anchor: "l",
      });

      return (t) => {
        proc.set({ k: ramp(t, 0.2, 0.5, E.lin) });
        const access0 = ramp(t, 4.0, 4.6, E.out);
        access.forEach((a, j) => {
          const fromLate = Math.floor(j / 2) === 2;
          const hot = fromLate && j % 2 === 0 && t >= 7.0;
          a.set({ k: access0, tone: hot ? "blue" : "grey", w: 4 });
        });
        threads.forEach((th, i) => {
          const redraw = i === 2 && t >= LATE;
          const k = redraw ? ramp(t, LATE + 0.1, LATE + 0.6, E.inOut) : ramp(t, START[i], START[i] + 0.6, E.inOut);
          th.set({ k });
          labels[i].set({ k: redraw ? ramp(t, LATE, LATE + 0.3, E.lin) : ramp(t, START[i], START[i] + 0.3, E.lin) });
          // the dot follows its own line, lap after lap
          const run = t - START[i] - 0.6;
          const hide = (i === 2 && t >= LATE - 0.1) || run <= 0;
          const f = hide ? 0 : (run * SPEED[i]) % 1;
          const p = th.at(f);
          dots[i].set({ x: p.x, y: p.y, o: hide ? 0 : 1 });
        });
        late.set({ k: ramp(t, LATE, LATE + 0.3, E.lin) });
        // thread 3 (started later) reaches the shared total
        const kr = ramp(t, 6.6, 7.0, E.inOut);
        const kd = ramp(t, 7.0, 7.6, E.inOut);
        const top = threads[2].at(kr);
        const a = access[4].a;
        const b = access[4].b;
        const pos = t < 7.0 ? top : { x: lerp(a.x, b.x, kd), y: lerp(a.y, b.y, kd) };
        runner.set({ x: pos.x, y: pos.y, o: t >= 6.6 && kd < 1 ? 1 : 0 });
        const got = ramp(t, 7.6, 8.0, E.lin);
        total.set({
          k: ramp(t, 3.4, 3.8, E.lin),
          ring: got > 0 ? "green" : "",
          ringK: got,
          s: 1 + 0.06 * flash(t, 7.6, 8.0),
        });
        file.set({ k: ramp(t, 3.6, 4.0, E.lin) });
        V.l5.drawOn(tick, ramp(t, 7.7, 8.1, E.out));
        const kn = ramp(t, 8.6, 9.0, E.lin);
        V.place(env, { s: 0.7 + 0.3 * E.pop(kn), o: Math.min(1, kn * 4) });
        nothing.set({ k: ramp(t, 8.8, 9.2, E.lin) });
      };
    },
  });
})();

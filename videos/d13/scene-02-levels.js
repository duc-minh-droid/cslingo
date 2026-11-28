/* Lecture 13 (ds-13) · scene 2 (LEVELS OF PARALLELISM): Crumb & Co must tally a year of receipts before the doors open at
   7:00; one worker going through the slips one by one is too slow. Parallelism can happen at four levels: process, thread,
   instruction and data; this lecture is about threads (lesson 13.1).
   Colours: grey slips, clock and the instruction level; blue the worker, the slips it has tallied and the thread level;
   purple the process level; orange the data level; green the shop door; red "too slow".
   Story (local seconds): 0.5 the pile, clock and door pop; 0.9-4.4 the blue worker moves one slip at a time to the done stack;
   2.6 the red "one by one: too slow"; 4.4-5.2 the picture slides up and left; 4.6 / 5.0 / 5.4 / 5.8 the four level boxes pop;
   7.6 the Thread box lifts with a thick blue ring and the tag "this lecture". Hold to 11. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, lerp, ease: E } = V;
  const T = D13.tone;

  const N = 12; // slips drawn in the pile
  const STEP = 0.5; // seconds per slip: deliberately slow
  const RUN = [0.9, 4.4];
  const SLIP = { w: 180, h: 24, gap: 14, pileX: 300, doneX: 560, base: 250 };
  const slipY = (i) => SLIP.base - i * SLIP.gap;
  const LEVELS = [
    ["purple", "Process", "whole programs"],
    ["blue", "Thread", "streams inside one"],
    ["grey", "Instruction", "steps of one stream"],
    ["orange", "Data", "one step, many values"],
  ];
  D13.same("levels: four levels", LEVELS.length, 4);

  V.scene({
    kicker: "LEVELS OF PARALLELISM",
    title: ["A mountain of receipts,", "many places to split it"],
    dur: 11,
    caps: [
      [0.4, 2.4, "Crumb & Co must tally a year of receipts before 7."],
      [2.6, 4.2, "One worker, one by one, is too slow."],
      [4.4, 7.4, "Parallelism works at the process, thread, instruction and data level."],
      [7.6, 10.7, "This lecture: threads inside one machine."],
    ],
    build(stage) {
      const grp = V.h("div", { style: { position: "absolute", left: "0px", top: "0px" } });
      stage.append(grp);
      const svg = V.l5.svg(grp);
      const clock = svg.appendChild(D13.clock(330, 40, 70));
      const door = svg.appendChild(D13.door(500, 40, 70, "green"));
      const seven = D4.tag(grp, { x: 415, y: 40, text: "7:00", tone: "grey", solid: true, fs: 30 });
      const slips = Array.from({ length: N }, () => {
        const g = V.s("g", {});
        const r = V.s("rect", { x: 0, y: 0, width: SLIP.w, height: SLIP.h, rx: 6, "stroke-width": 3 });
        const l = V.s("line", {
          x1: 18,
          y1: 12,
          x2: SLIP.w - 40,
          y2: 12,
          "stroke-width": 4,
          "stroke-linecap": "round",
        });
        g.append(r, l);
        svg.append(g);
        return { g, r, l };
      });
      const worker = svg.appendChild(
        V.s("circle", { r: 16, "stroke-width": 3, style: { fill: T("blue").c, stroke: T("blue").lip } }),
      );
      const slow = D4.tag(grp, { x: 520, y: 320, text: "one by one: too slow", tone: "red", solid: true });

      const boxes = LEVELS.map(([tone, title, sub], i) =>
        D13.box(stage, { x: i * 238, y: 330, w: 222, h: 190, tone, title, sub, fs: 32 }),
      );
      const thisLecture = D4.tag(stage, { x: 238 + 111, y: 572, text: "this lecture", tone: "blue", solid: true });

      return (t) => {
        const kIn = ramp(t, 0.5, 0.9, E.lin);
        const mv = ramp(t, 4.4, 5.2, E.inOut);
        V.place(grp, { x: lerp(0, -250, mv), y: lerp(140, 0, mv) });
        [clock, door].forEach((g) => V.place(g, { s: 0.7 + 0.3 * E.pop(kIn), o: Math.min(1, kIn * 4) }));
        seven.set({ k: kIn });

        // the worker: one slip every STEP seconds moves from the pile to the done stack
        const p = Math.max(0, (Math.min(t, RUN[1]) - RUN[0]) / STEP);
        const done = Math.min(N, Math.floor(p));
        const frac = p - Math.floor(p);
        slips.forEach((s, i) => {
          const order = N - 1 - i; // the top slip goes first
          let x = SLIP.pileX;
          let y = slipY(i);
          let tone = "grey";
          if (order < done) {
            x = SLIP.doneX;
            y = slipY(order);
            tone = "blue";
          } else if (order === done && t > RUN[0] && t < RUN[1]) {
            const k = E.inOut(ramp(frac, 0.5, 1, E.lin));
            x = lerp(SLIP.pileX, SLIP.doneX, k);
            y = lerp(slipY(i), slipY(order), k) - 50 * Math.sin(Math.PI * k);
            tone = k > 0 ? "blue" : "grey";
          }
          const c = T(tone);
          s.r.style.fill = tone === "grey" ? "var(--panel)" : c.c;
          s.r.style.stroke = c.lip;
          s.l.style.stroke = tone === "grey" ? T("grey").c : c.on;
          s.g.setAttribute("transform", `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
          V.show(s.g, ramp(t, 0.5 + 0.02 * i, 0.7 + 0.02 * i, E.lin));
        });
        // the worker dot sits on the slip it is reading, or rides with it
        const cur = Math.min(done, N - 1);
        const k = t > RUN[0] && t < RUN[1] ? E.inOut(ramp(frac, 0.5, 1, E.lin)) : 0;
        const wx = lerp(SLIP.pileX, SLIP.doneX, k) + SLIP.w + 22;
        const wy = lerp(slipY(N - 1 - cur), slipY(cur), k) - 50 * Math.sin(Math.PI * k) + SLIP.h / 2;
        worker.setAttribute("cx", wx.toFixed(1));
        worker.setAttribute("cy", wy.toFixed(1));
        V.show(worker, ramp(t, 0.7, 0.9, E.lin));
        slow.set({ k: ramp(t, 2.6, 3.0, E.lin), o: 1 - ramp(t, 4.4, 4.7, E.lin), s: 1 + 0.08 * flash(t, 2.9, 3.3) });

        // the four levels
        boxes.forEach((b, i) => {
          const lift = i === 1 ? ramp(t, 7.6, 8.0, E.out) : 0;
          b.set({
            k: ramp(t, 4.6 + 0.4 * i, 5.0 + 0.4 * i, E.lin),
            y: -14 * lift,
            ring: lift > 0 ? "blue" : "",
            ringK: lift,
          });
        });
        thisLecture.set({ k: ramp(t, 7.8, 8.2, E.lin), y: -14 * ramp(t, 7.6, 8.0, E.out) });
      };
    },
  });
})();

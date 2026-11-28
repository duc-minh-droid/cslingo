/* Lecture 13 (ds-13) · scene 4 (SISD, SIMD, MIMD): parallel machines sorted by counting instruction streams and data streams
   (lesson 13.2). Three columns build in turn. SISD: one instruction, one processor, one data value (10 -> 12 with 20% VAT).
   SIMD: one instruction "add 20% VAT" fans out to four processors that all fire at the same instant, each on its own price
   (10, 5, 20, 15 -> 12, 6, 24, 18; D13.FLYNN). MIMD: four different instruction streams (four shapes) reach four processors
   at different times, each with its own data. 11.0: a grey bracket under MIMD, "= cores running threads".
   Colours: purple instruction streams and their dots, grey processors and wires, orange data, grey bracket.
   Story (local seconds): SISD 0.5 build, 1.5-2.3 the dot, 2.5 the value changes, 2.7 count tags; SIMD 3.6 build, 4.8-5.3 the
   dot to the fan, 5.3-5.9 four dots at once, 6.1 all four values change, 6.4 tags; MIMD 7.8 build, 8.6-9.9 four shaped dots
   at their own times, 10.2 tags; 11.0 the bracket. Hold to 14. */
(function () {
  const V = window.VID;
  const D4 = V.d4;
  const D13 = V.d13;
  const { ramp, flash, lerp, ease: E } = V;
  const F = D13.FLYNN;
  D13.same("flynn: stream counts", F.kinds, { SISD: { i: 1, d: 1 }, SIMD: { i: 1, d: 4 }, MIMD: { i: 4, d: 4 } });

  const COLW = 300;
  const colX = (c) => c * 318;
  const Y = { head: 26, ins: 60, insH: 90, proc: 220, procH: 64, data: 330, dataH: 80, tag1: 450, tag2: 512 };
  const SHAPES = ["circle", "square", "triangle", "diamond"];
  const MIMD_DATA = ["7", "3", "9", "5"];
  const MIMD_GO = [8.6, 9.2, 8.9, 9.5]; // each stream sends its instruction at its own time
  const items = (c, n) =>
    n === 1
      ? [{ x: colX(c) + 50, w: 200, cx: colX(c) + 150 }]
      : Array.from({ length: n }, (_, i) => ({ x: colX(c) + i * 78, w: 66, cx: colX(c) + i * 78 + 33 }));
  const COLS = [
    { name: "SISD", t0: 0.5, n: 1, ni: 1 },
    { name: "SIMD", t0: 3.6, n: 4, ni: 1 },
    { name: "MIMD", t0: 7.8, n: 4, ni: 4 },
  ];

  V.scene({
    kicker: "SISD, SIMD, MIMD",
    title: ["Count the instruction streams,", "then count the data streams"],
    dur: 14,
    caps: [
      [0.4, 3.4, "SISD: one instruction stream, one data stream."],
      [3.6, 7.6, "SIMD: the same instruction on many processors, each with its own data."],
      [7.8, 10.8, "MIMD: each processor has its own instructions and its own data."],
      [11.0, 13.7, "Cores running separate threads work this way."],
    ],
    build(stage) {
      const svgW = V.l5.svg(stage);
      const cols = COLS.map((C, c) => {
        const cx = colX(c) + COLW / 2;
        const P = items(c, C.n);
        const head = D4.tag(stage, { x: cx, y: Y.head, text: C.name, tone: "grey", solid: true, fs: 32 });
        let ins;
        if (C.ni === 1) {
          const sub = "instruction";
          ins = [
            D13.box(stage, {
              x: colX(c),
              y: Y.ins,
              w: COLW,
              h: Y.insH,
              tone: "purple",
              title: `add ${F.pct}% VAT`,
              sub,
            }),
          ];
        } else
          ins = P.map((p) =>
            D13.box(stage, { x: p.x, y: Y.ins + 13, w: p.w, h: 64, tone: "purple", title: "", r: 16, plain: true }),
          );
        const fan = { x: cx, y: Y.ins + Y.insH + 18 };
        const wiresUp = P.map((p, i) =>
          C.ni === 1
            ? D13.seg(svgW, { a: { x: cx, y: Y.ins + Y.insH }, b: { x: p.cx, y: Y.proc }, tone: "purple" })
            : D13.seg(svgW, { a: { x: P[i].cx, y: Y.ins + 77 }, b: { x: p.cx, y: Y.proc }, tone: "purple" }),
        );
        const procs = P.map((p, i) =>
          D13.box(stage, {
            x: p.x,
            y: Y.proc,
            w: p.w,
            h: Y.procH,
            tone: "grey",
            title: C.n === 1 ? "Processor" : `P${i + 1}`,
            fs: 28,
            r: 16,
          }),
        );
        const wiresDn = P.map((p) => D13.seg(svgW, { a: { x: p.cx, y: Y.proc + Y.procH }, b: { x: p.cx, y: Y.data } }));
        const before = c === 2 ? MIMD_DATA : F.prices.map(String);
        const after = c === 2 ? MIMD_DATA : F.vat.map(String);
        const data = P.map((p, i) =>
          D13.box(stage, {
            x: p.x,
            y: Y.data + (C.n === 1 ? 0 : 8),
            w: p.w,
            h: C.n === 1 ? Y.dataH : 64,
            tone: "orange",
            title: before[i],
            sub: C.n === 1 ? "data" : "",
            fs: 30,
            r: 16,
          }),
        );
        const iWord = C.ni === 1 ? "1 instruction" : `${C.ni} instructions`;
        const t1 = D4.tag(stage, { x: cx, y: Y.tag1, text: iWord, tone: "purple", solid: true });
        const t2 = D4.tag(stage, { x: cx, y: Y.tag2, text: `${C.n} data`, tone: "orange", solid: true });
        return { C, P, head, ins, fan, wiresUp, procs, wiresDn, data, before, after, t1, t2 };
      });
      // MIMD instruction shapes and every travelling dot sit on top
      const svgTop = V.l5.svg(stage);
      const shapes = cols[2].P.map((p, i) => D13.mark(svgTop, { shape: SHAPES[i], tone: "purple", r: 14 }));
      const dots = cols.map((col) =>
        col.P.map((p, i) => D13.mark(svgTop, { shape: col.C.ni === 4 ? SHAPES[i] : "circle", tone: "purple", r: 12 })),
      );
      const lead = cols.map(() => D13.mark(svgTop, { shape: "circle", tone: "purple", r: 12 }));
      const bracket = D13.seg(svgTop, { a: { x: colX(2), y: 558 }, b: { x: colX(2) + COLW, y: 558 }, w: 6 });
      const ends = [colX(2), colX(2) + COLW].map((x) => D13.seg(svgTop, { a: { x, y: 536 }, b: { x, y: 558 }, w: 6 }));
      const threadsTag = D4.tag(stage, { x: 924, y: 602, text: "= cores running threads", tone: "grey", anchor: "r" });

      // when each processor of a column receives its instruction
      const arrive = (c, i) => (c === 0 ? 2.3 : c === 1 ? 5.9 : MIMD_GO[i] + 0.6);
      return (t) => {
        cols.forEach((col, c) => {
          const t0 = col.C.t0;
          col.head.set({ k: ramp(t, t0, t0 + 0.3, E.lin) });
          col.ins.forEach((b, i) => b.set({ k: ramp(t, t0 + 0.1 + 0.08 * i, t0 + 0.4 + 0.08 * i, E.lin) }));
          col.wiresUp.forEach((w) => w.set({ k: ramp(t, t0 + 0.3, t0 + 0.6, E.out) }));
          col.procs.forEach((b, i) => {
            const fl = flash(t, arrive(c, i), arrive(c, i) + 0.4);
            b.set({ k: ramp(t, t0 + 0.4 + 0.06 * i, t0 + 0.7 + 0.06 * i, E.lin), s: 1 + 0.12 * fl, solid: fl > 0.3 });
          });
          col.wiresDn.forEach((w) => w.set({ k: ramp(t, t0 + 0.6, t0 + 0.8, E.out) }));
          col.data.forEach((b, i) => {
            const at = arrive(c, i) + 0.2;
            const fl = flash(t, at, at + 0.4);
            b.set({
              k: ramp(t, t0 + 0.7 + 0.06 * i, t0 + 1.0 + 0.06 * i, E.lin),
              s: 1 + 0.12 * fl,
              title: t >= at + 0.2 ? col.after[i] : col.before[i],
            });
          });
          const tagAt = c === 0 ? 2.7 : c === 1 ? 6.4 : 10.2;
          col.t1.set({ k: ramp(t, tagAt, tagAt + 0.3, E.lin) });
          col.t2.set({ k: ramp(t, tagAt + 0.15, tagAt + 0.45, E.lin) });

          // dots
          if (col.C.ni === 1) {
            const go = c === 0 ? 1.5 : 4.8;
            const src = { x: colX(c) + COLW / 2, y: Y.ins + Y.insH - 14 };
            if (c === 0) {
              const k = ramp(t, go, 2.3, E.inOut);
              lead[c].set({ x: src.x, y: lerp(src.y, Y.proc, k), o: k > 0 && k < 1 ? 1 : 0 });
              dots[c][0].set({ o: 0 });
            } else {
              const k1 = ramp(t, go, 5.3, E.inOut);
              lead[c].set({ x: src.x, y: lerp(src.y, col.fan.y, k1), o: k1 > 0 && t < 5.3 ? 1 : 0 });
              const k2 = ramp(t, 5.3, 5.9, E.inOut);
              col.P.forEach((p, i) => {
                const w = col.wiresUp[i];
                const f = lerp(0.15, 1, k2);
                dots[c][i].set({ x: lerp(w.a.x, w.b.x, f), y: lerp(w.a.y, w.b.y, f), o: t >= 5.3 && k2 < 1 ? 1 : 0 });
              });
            }
          } else {
            lead[c].set({ o: 0 });
            col.P.forEach((p, i) => {
              const k = ramp(t, MIMD_GO[i], MIMD_GO[i] + 0.6, E.inOut);
              dots[c][i].set({ x: p.cx, y: lerp(Y.ins + 77, Y.proc, k), o: k > 0 && k < 1 ? 1 : 0 });
            });
          }
        });
        cols[2].P.forEach((p, i) => {
          const k = ramp(t, 7.9 + 0.08 * i, 8.2 + 0.08 * i, E.lin);
          shapes[i].set({ x: p.cx, y: Y.ins + 45, s: 0.6 + 0.4 * E.pop(k), o: Math.min(1, k * 4) });
        });
        const kb = ramp(t, 11.0, 11.4, E.out);
        bracket.set({ k: kb });
        ends.forEach((e) => e.set({ k: kb, o: kb > 0 ? 1 : 0 }));
        threadsTag.set({ k: ramp(t, 11.2, 11.6, E.lin) });
      };
    },
  });
})();

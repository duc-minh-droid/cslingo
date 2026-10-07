/* Lecture 4 · scene 09-crossover: the same two parents cut three ways (one point, two points, uniform mask). Each child tile
   takes the colour of the parent it came from; every string comes from L4.crossMask / L4.cross. */
(function () {
  const V = window.VID;
  const L4 = V.l4;
  const { ramp, clamp, lerp, ease: E } = V;

  const P = ["ABCDEFGH", "KLMNOPQR"];
  const N = P[0].length;
  const TONE = ["blue", "purple"]; // parent 1, parent 2
  const MASKS = [L4.crossMask(N, [5]), L4.crossMask(N, [2, 6]), "01001101"];
  const KIDS = MASKS.map((m) => L4.cross(P[0], P[1], m));
  const WANT = [
    ["ABCDEPQR", "KLMNOFGH"],
    ["ABMNOPGH", "KLCDEFQR"],
    ["ALCDOPGR", "KBMNEFQH"],
  ];
  WANT.forEach((w, s) => {
    if (w.join() !== KIDS[s].join()) throw new Error(`scene 9: crossover ${s} gives ${KIDS[s]}, expected ${w}`);
  });
  if (MASKS[0] !== "00000111" || MASKS[1] !== "00111100") throw new Error("scene 9: cut masks wrong");

  // layout (stage px)
  const X0 = 200;
  const SZ = 72;
  const PITCH = 80;
  const ROW = { p1: 20, p2: 108, mask: 214, c1: 330, c2: 418 };
  const OP_Y = 524;
  const LINE_Y = [12, 500];
  const cutX = (k) => X0 + PITCH * k - 4;
  const TAG_DY = (SZ - 46) / 2;
  // timeline (seconds)
  const T = { op: [1.5, 5.6, 8.2], flip: [6.3, 9.4], maskIn: 8.6 };
  const FLY = [
    { t0: 2.2, step: 0.12, dur: 0.46 },
    { t0: 3.6, step: 0.1, dur: 0.5 },
  ];
  const OPS = ["1-point", "2-point", "uniform"];

  const pop = (k) => ({ s: 0.8 + 0.2 * E.pop(clamp(k)), o: clamp(k * 3) });

  // for child c and gene i at stage s: the letter and the parent (0 or 1) it came from
  const source = (s, c, i) => {
    const from = (Number(MASKS[s][i]) + c) % 2;
    return { ch: P[from][i], tone: TONE[from] };
  };
  const stageOf = (s, c, i) => ({ ...source(s, c, i), text: KIDS[s][c][i] });
  // genes of child c that change between stage s-1 and s, so they can flip one after another
  const changed = (s, c) => [...P[0]].map((_, i) => i).filter((i) => KIDS[s][c][i] !== KIDS[s - 1][c][i]);

  V.scene({
    kicker: "CROSSOVER",
    title: ["Crossover mixes", "two parents' genes"],
    dur: 12,
    caps: [
      [1.4, 5.4, "One cut: swap the tails."],
      [5.8, 8.0, "Two cuts: swap the middle part."],
      [8.6, 11.5, "Uniform: a 1 in the mask swaps that gene."],
    ],
    build(stage) {
      // cut lines first, so the tiles sit on top of them
      const lineA = L4.cutLine(stage, { x: cutX(5), y1: LINE_Y[0], y2: LINE_Y[1] });
      const lineB = L4.cutLine(stage, { x: cutX(6), y1: LINE_Y[0], y2: LINE_Y[1] });
      const row = (y, vals, tones) =>
        L4.tiles(stage, { x: X0, y, vals, w: SZ, h: SZ, gap: PITCH - SZ, font: 40, tones });
      const par = [row(ROW.p1, [...P[0]], Array(N).fill("blue")), row(ROW.p2, [...P[1]], Array(N).fill("purple"))];
      const mask = row(
        ROW.mask,
        [...MASKS[2]],
        [...MASKS[2]].map((b) => (b === "1" ? "purple" : "grey")),
      );
      const kids = [ROW.c1, ROW.c2].map((y, c) =>
        row(
          y,
          [...KIDS[0][c]],
          [...KIDS[0][c]].map((_, i) => source(0, c, i).tone),
        ),
      );

      const tg = (text, tone, y) => L4.tag(stage, { x: 12, y: y + TAG_DY, text, tone });
      const tags = [
        tg("parent 1", "blue", ROW.p1),
        tg("parent 2", "purple", ROW.p2),
        tg("mask", "grey", ROW.mask),
        tg("child 1", "grey", ROW.c1),
        tg("child 2", "grey", ROW.c2),
      ];
      const op = L4.tag(stage, { x: X0, y: OP_Y, text: OPS[0], tone: "purple", solid: true });

      return (t) => {
        // parents pop in one after another
        par.forEach((r, p) => r.all((i) => ({ ...pop(ramp(t, 0.5 + p * 0.1 + i * 0.06, 0.8 + p * 0.1 + i * 0.06)) })));
        tags[0].set(pop(ramp(t, 0.5, 0.9)));
        tags[1].set(pop(ramp(t, 0.6, 1.0)));
        // operator tag: text follows the phase and pops when it changes
        const ph = T.op.filter((a) => t >= a).length - 1;
        op.set(ph < 0 ? { o: 0 } : { text: OPS[ph], ...pop(ramp(t, T.op[ph], T.op[ph] + 0.3)) });

        // cut lines
        const fade = 1 - ramp(t, 8.2, 8.6, E.lin);
        lineA.set({ x: lerp(cutX(5), cutX(2), ramp(t, 5.6, 6.1, E.inOut)), k: ramp(t, 1.5, 2.0), o: fade });
        lineB.set({ k: ramp(t, 6.0, 6.4), o: fade });

        // mask row
        tags[2].set(pop(ramp(t, T.maskIn, T.maskIn + 0.4)));
        mask.all((i) => pop(ramp(t, T.maskIn + i * 0.07, T.maskIn + 0.3 + i * 0.07)));

        // children: fly down from their parents, then flip tile by tile when the cut changes
        kids.forEach((r, c) => {
          const f = FLY[c];
          tags[3 + c].set(pop(ramp(t, f.t0, f.t0 + 0.4)));
          r.all((i) => {
            const k = ramp(t, f.t0 + i * f.step, f.t0 + i * f.step + f.dur);
            const src = Number(MASKS[0][i]) === c ? 0 : 1; // parent row the tile starts on
            const dy = ([ROW.p1, ROW.p2][src] - [ROW.c1, ROW.c2][c]) * (1 - k);
            const base = { ...stageOf(0, c, i), y: dy, o: t < f.t0 + i * f.step ? 0 : 1 };
            let cur = stageOf(0, c, i);
            for (let s = 1; s <= 2; s++) {
              const rank = changed(s, c).indexOf(i);
              if (rank < 0) {
                cur = stageOf(s, c, i);
                continue;
              }
              const a = T.flip[s - 1] + rank * 0.07;
              if (t >= a + 0.5) cur = stageOf(s, c, i);
              else if (t >= a) {
                const to = stageOf(s, c, i);
                r.flip(i, ramp(t, a, a + 0.5, E.lin), {
                  from: cur.text,
                  to: to.text,
                  tone: cur.tone,
                  toTone: to.tone,
                  hop: 10,
                });
                return; // set by flip
              }
              if (t < a) break;
            }
            return { ...base, text: cur.text, tone: cur.tone };
          });
        });
      };
    },
  });
})();

/* Phase 9 · Fourier Transform & FFT (algo-9), scene 04: "Test each frequency with a spinning arrow" (14 s).
   To find out how much of a frequency is in a signal, spin a purple test arrow at that frequency, scale it by each sample and add the
   scaled arrows tip to tail. Run for real on 8 samples of ONE cosine cycle (the same samples as scene 5): spin once (a match: the blue
   chain zig-zags to the right and the orange total is 4) and spin twice (no match: the chain walks a rectangle and closes on the start,
   the total is 0). Left column: the 8 samples (dots on the blue wave, the one in use wears a purple ring), the test tag and the wheel
   with the purple arrow. Right column: the arrow plane (the blue chain, the orange total arrow, the grey origin), the total and the verdict.
   Colours (video-wide): blue = the signal / the scaled arrows, purple = the test arrow, orange = the total, green = a match, grey = none.
   The first two samples take a full second each (that is where the idea is taught); a small blue label above the arrow that is growing says by
   how much the sample scales the test arrow (x 1, x 0.7, x 0 = no arrow, x -0.7 = flipped). Each verdict stays on screen for a full second
   (with its caption) before the picture moves on.
   Every number comes from A9.chain / A9.W8 (common.js) and is asserted below. update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, ease: E } = V;
  const TAU = A9.TAU;
  const round6 = (v) => Math.round(v * 1e6) / 1e6;

  // ---------- the numbers, from the real algorithm ----------
  const ch1 = A9.chain(1); // spin once: a match
  const ch2 = A9.chain(2); // spin twice: no match
  const CH = [null, ch1, ch2];
  const X = A9.W8.x;

  // ---------- the timeline (local seconds) ----------
  // run 1 (spin once): the first two samples take 1.0 and 0.9 s (the idea is taught there), the other six 0.4 s each; run 2 (spin twice): 0.35 s each
  const RUNS = [
    { t0: 3.0, durs: [1.0, 0.9, 0.4, 0.4, 0.4, 0.4, 0.4, 0.4] }, // run 1: 3.0 to 7.3
    { t0: 11.1, durs: Array.from({ length: 8 }, () => 0.35) }, // run 2: 11.1 to 13.9
  ];
  const startOf = (r, n) => RUNS[r - 1].t0 + RUNS[r - 1].durs.slice(0, n).reduce((a, b) => a + b, 0); // when the test arrow reaches sample n
  const endOf = (r) => startOf(r, 8);
  const DUR = 16;
  const T = {
    tag: [0.2, 0.6],
    curve: [0.4, 1.2],
    dot0: 1.0, // the eight dots pop 0.1 s apart
    wheel: [1.8, 2.3],
    wheelArrow: [1.9, 2.3],
    plane: [2.4, 2.8],
    origin: [2.7, 3.1],
    total: [7.5, 8.3],
    stat1: [8.1, 8.5],
    match: [8.5, 8.9],
    reset: [9.9, 10.5], // the first run's chain, total, number and verdict fade out (a full second after the verdict); the test arrow shrinks
    spins2: [10.6, 10.95], // the tag becomes 'test: 2 spins' and pops again
    wheel2: [10.7, 11.05], // the test arrow comes back
    ring: [13.9, 14.3],
    stat2: [14.1, 14.5],
    nomatch: [14.3, 14.7],
  };
  const CAPS = [
    [1.2, 2.9, `To find the bars, take ${X.length} samples.`],
    [3.2, 5.0, "Each sample scales a spinning arrow."],
    [5.0, 7.0, "Zero makes no arrow. Negative flips it."],
    [7.5, 9.5, "Right speed: they all lean right and add."],
    [11.1, 12.5, "Now spin twice instead."],
    [12.6, 15.6, "The arrows loop back and cancel."],
  ];
  const run = (t) => (t < T.spins2[0] ? 1 : 2);
  // which sample the test arrow is at (fractional: 2.5 is half way from sample 2 to sample 3); a pure function of t
  const curOf = (t, r) => {
    const R = RUNS[r - 1];
    if (t <= R.t0) return 0;
    let a = R.t0;
    for (let n = 0; n < R.durs.length; n++) {
      if (t < a + R.durs[n]) return n + (t - a) / R.durs[n];
      a += R.durs[n];
    }
    return R.durs.length;
  };
  const factor = (v) => String(+v.toFixed(1)); // 1, 0.7, 0, -0.7, -1 (never '-0')

  function check() {
    A9.same(
      "scene 4 match",
      ch1.sum.map((v) => round6(v)),
      [4, 0],
    );
    A9.same(
      "scene 4 mismatch",
      ch2.sum.map((v) => Math.abs(round6(v))),
      [0, 0],
    );
    A9.close("scene 4 the match is as long as bar 1 of the table", ch1.len, A9.W8.bars[1], 1e-9);
    A9.close("scene 4 the mismatch is as long as bar 2 of the table", ch2.len, A9.W8.bars[2], 1e-9);
    A9.same("scene 4 eight samples", X.length, 8);
    A9.same("scene 4 eight arrows in each chain", [ch1.arrows.length, ch2.arrows.length], [8, 8]);
    // samples 2 and 6 are 0, so their arrows have no length
    A9.same(
      "scene 4 the spin-once chain: the two zero samples",
      ch1.arrows.map((a) => round6(Math.hypot(a.to[0] - a.from[0], a.to[1] - a.from[1])) === 0),
      [false, false, true, false, false, false, true, false],
    );
    // each arrow is the sample times the unit arrow that sits at sample n on the wheel
    [ch1, ch2].forEach((ch) =>
      ch.arrows.forEach((a, n) => {
        const th = (-TAU * ch.k * n) / 8;
        A9.close(`scene 4 k ${ch.k} arrow ${n} x`, a.to[0] - a.from[0], X[n] * Math.cos(th), 1e-9);
        A9.close(`scene 4 k ${ch.k} arrow ${n} y`, a.to[1] - a.from[1], X[n] * Math.sin(th), 1e-9);
      }),
    );
    // the chain starts at the origin, each arrow starts where the last one ended, and the spin-twice chain closes
    [ch1, ch2].forEach((ch) => {
      A9.same(`scene 4 k ${ch.k} starts at the origin`, ch.arrows[0].from, [0, 0]);
      ch.arrows
        .slice(1)
        .forEach((a, i) => A9.same(`scene 4 k ${ch.k} arrow ${i + 1} is tip to tail`, a.from, ch.arrows[i].to));
    });
    A9.close("scene 4 the rectangle is 1 wide", Math.max(...ch2.pts.map((p) => p[0])), 1, 1e-9);
    A9.close("scene 4 the rectangle is 1.414 tall", -Math.min(...ch2.pts.map((p) => p[1])), Math.SQRT2, 1e-9);
    // everything fits the plane's window
    [...ch1.pts, ...ch2.pts].forEach((p) => {
      if (!(p[0] > -0.6 && p[0] < 4.6 && p[1] > -2.1 && p[1] < 1.2))
        throw new Error("VID.a9: scene 4 a corner leaves the plane");
    });
    // the labels say what each sample does to the arrow: the real sample values, rounded to one place
    A9.same("scene 4 the scale labels", X.map(factor), ["1", "0.7", "0", "-0.7", "-1", "-0.7", "0", "0.7"]);
    // the sweeps end where the verdicts start and the captions follow the picture
    A9.close("scene 4 run 1 ends at 7.3", endOf(1), 7.3, 1e-9);
    A9.close("scene 4 run 2 ends at 13.9", endOf(2), 13.9, 1e-9);
    A9.same(
      "scene 4 the first two samples take about a second each",
      [RUNS[0].durs[0] >= 1.0, RUNS[0].durs[1] >= 0.9],
      [true, true],
    );
    A9.same("scene 4 the total arrow starts once the sweep is over", T.total[0] >= endOf(1) - 1e-9, true);
    A9.same("scene 4 the circle closes before its ring", T.ring[0] >= endOf(2) - 1e-9, true);
    // every verdict stays a full second (the caption is on screen with it) before the picture moves on
    A9.same(
      "scene 4 the match is held for a second before the reset, the last frame for a second before the scene fades",
      [T.reset[0] - T.match[1] >= 1 - 1e-9, DUR - 0.3 - T.nomatch[1] >= 1 - 1e-9],
      [true, true],
    );
    const starts = [T.dot0 + 0.1, startOf(1, 0) + 0.2, startOf(1, 2), T.total[0], T.spins2[0], startOf(2, 4)];
    A9.same(
      "scene 4 every caption starts after its picture does (and within half a second of it)",
      CAPS.map((c, i) => c[0] >= starts[i] - 1e-9 && c[0] - starts[i] < 0.5 + 1e-9),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 4 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
    A9.same(
      "scene 4 the second run waits for the second tag and the test arrow",
      T.wheel2[1] <= RUNS[1].t0 + 1e-9,
      true,
    );
  }

  V.scene({
    kicker: "THE TEST",
    title: ["Test each frequency", "with a spinning arrow"],
    dur: DUR,
    caps: CAPS,
    build(stage) {
      check();
      // ---- left column: the samples, the test tag, the wheel ----
      const sTag = A9.tag(stage, { x: 0, y: 0, text: `${X.length} samples`, tone: "blue" });
      const S = A9.plot(stage, {
        x: 0,
        y: 64,
        w: 400,
        h: 200,
        view: [-0.6, 7.6, -1.5, 1.5],
        axes: "mid",
        pad: { l: 20, r: 20, t: 16, b: 56 },
        xticks: [0, 1, 2, 3, 4, 5, 6, 7],
      });
      const curve = S.curve((x) => Math.cos((TAU * x) / 8), { tone: "blue", w: 4, x0: 0, x1: 8 });
      const dots = S.dots({ max: 8, r: 9 });
      const spinsText = (k) => `test: ${k} spin${k > 1 ? "s" : ""}`;
      const testTag = A9.tag(stage, { x: 0, y: 292, text: spinsText(1), tone: "purple", solid: true });
      const W = A9.wheel(stage, { x: 0, y: 356, w: 400, h: 264 }); // ends at y 620, the lip at 626

      // ---- right column: the arrow plane, the total and the verdict ----
      const pTag = A9.tag(stage, { x: 430, y: 0, text: "sample × arrow, added", tone: "blue" });
      const Pl = A9.plot(stage, {
        x: 430,
        y: 64,
        w: 506,
        h: 330,
        equal: true,
        view: [-0.6, 4.6, -2.1, 1.2],
        axes: "mid",
      });
      const origin = Pl.dot({ tone: "grey", r: 9 }); // made first, so the arrows (and the head that closes the loop) draw over it
      const arrows = X.map(() => Pl.vec({ tone: "blue", w: 6, head: 20 }));
      const total = Pl.vec({ tone: "orange", w: 10, head: 28 });
      const scale = Pl.text({ fs: 28, tone: "blue" }); // 'x 0.7': how much the sample scales the test arrow, above the arrow that is growing
      const stat = A9.stat(stage, { x: 430, y: 430, w: 300, h: 80, label: "total", tone: "orange" });
      const verdict = A9.tag(stage, { x: 430, y: 540, text: "a match", tone: "green", solid: true });

      return (t) => {
        const r = run(t);
        const ch = CH[r];
        const cur = curOf(t, r);
        const fade = 1 - ramp(t, T.reset[0], T.reset[1], E.lin); // the first run fades out
        const keep = r === 1 ? fade : 1; // ... the second run stays
        const going = cur > 0 && cur < 8;

        // ---- the samples ----
        const kTag = ramp(t, T.tag[0], T.tag[1], E.lin);
        sTag.set({ k: kTag });
        const kS = ramp(t, T.tag[0], T.tag[0] + 0.4, E.lin);
        S.set({ o: Math.min(1, kS * 3), s: 0.94 + 0.06 * E.pop(kS) });
        curve.set({ k: ramp(t, T.curve[0], T.curve[1], E.inOut) });
        dots.set(
          X.map((y, n) => {
            const k = A9.seq(t, T.dot0, 0.1, 0.3, n);
            return {
              x: n,
              y,
              o: Math.min(1, k * 4),
              s: 0.5 + 0.5 * E.pop(k),
              ring: going && Math.floor(cur) === n ? "purple" : null,
              ringK: 1,
            };
          }),
        );

        // ---- the test arrow ----
        const spinsHop = flash(t, T.spins2[0], T.spins2[1]); // a hop, not a pulse: the wider tag stays 12 px inside the stage
        testTag.set({
          text: spinsText(r),
          k: ramp(t, T.wheel[0], T.wheel[0] + 0.4, E.lin),
          y: -8 * spinsHop,
        });
        const kW = ramp(t, T.wheel[0], T.wheel[1], E.lin);
        const trail = r === 1 ? Math.floor(cur) * (1 - ramp(t, T.reset[0], T.reset[1], E.lin)) : Math.floor(cur);
        W.set({
          k: r,
          cur: Math.min(7.999, cur),
          upto: trail,
          curK:
            ramp(t, T.wheelArrow[0], T.wheelArrow[1], E.lin) * (1 - ramp(t, T.reset[0], T.reset[1], E.lin)) +
            ramp(t, T.wheel2[0], T.wheel2[1], E.lin),
          o: Math.min(1, kW * 3),
          s: 0.94 + 0.06 * E.pop(kW),
        });

        // ---- the arrow plane ----
        const kP = ramp(t, T.plane[0], T.plane[1], E.lin);
        pTag.set({ k: kP });
        Pl.set({ o: Math.min(1, kP * 3), s: 0.94 + 0.06 * E.pop(kP) });
        arrows.forEach((a, n) => {
          const seg = ch.arrows[n];
          a.set({
            x1: seg.from[0],
            y1: seg.from[1],
            x2: seg.to[0],
            y2: seg.to[1],
            k: ramp(cur, n, n + 0.9),
            o: keep,
          });
        });
        // the factor of the sample the test arrow is at (the first run only), above the blue arrow that grows
        const sn = Math.min(X.length - 1, Math.floor(cur));
        const sg = ch1.arrows[sn];
        const here = r === 1 && going ? Math.min(1, (cur - sn) * 8) * Math.min(1, (sn + 1 - cur) * 8) : 0;
        scale.set({
          text: `× ${factor(X[sn])}`,
          x: (sg.from[0] + sg.to[0]) / 2,
          y: 0,
          dy: -34,
          o: here * keep,
          s: 0.85 + 0.15 * E.pop(Math.min(1, (cur - sn) * 4)),
        });
        const kT = r === 1 ? ramp(t, T.total[0], T.total[1], E.inOut) : 0; // the orange total only exists when there is one
        total.set({ x1: 0, y1: 0, x2: ch1.sum[0], y2: ch1.sum[1], k: kT, o: keep });
        const ringK = ramp(t, T.ring[0], T.ring[1], E.lin);
        origin.set({
          x: 0,
          y: 0,
          o: ramp(t, T.origin[0], T.origin[1], E.lin),
          s: 0.5 + 0.5 * E.pop(ramp(t, T.origin[0], T.origin[1], E.lin)),
          ring: r === 2 && ringK > 0 ? "orange" : null,
          ringK,
        });

        // ---- the total and the verdict ----
        const k1 = ramp(t, T.stat1[0], T.stat1[1], E.lin);
        const k2 = ramp(t, T.stat2[0], T.stat2[1], E.lin);
        stat.set({
          text: r === 1 ? String(Math.round(ch1.len)) : String(Math.round(ch2.len)),
          tone: r === 1 ? "orange" : "grey",
          k: r === 1 ? k1 : k2,
          bump: r === 1 ? flash(t, T.stat1[0], T.stat1[0] + 0.3) : flash(t, T.stat2[0], T.stat2[0] + 0.3),
          o: keep,
        });
        verdict.set({
          text: r === 1 ? "a match" : "no match",
          tone: r === 1 ? "green" : "grey",
          solid: r === 1,
          k: r === 1 ? ramp(t, T.match[0], T.match[1], E.lin) : ramp(t, T.nomatch[0], T.nomatch[1], E.lin),
          o: keep,
        });
      };
    },
  });
})();

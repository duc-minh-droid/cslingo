/* Phase 9 · Fourier Transform & FFT (algo-9), scene 04: "Test each frequency with a spinning arrow" (14 s).
   To find out how much of a frequency is in a signal, spin a purple test arrow at that frequency, scale it by each sample and add the
   scaled arrows tip to tail. Run for real on 8 samples of ONE cosine cycle (the same samples as scene 5): spin once (a match: the blue
   chain zig-zags to the right and the orange total is 4) and spin twice (no match: the chain walks a rectangle and closes on the start,
   the total is 0). Left column: the 8 samples (dots on the blue wave, the one in use wears a purple ring), the test tag and the wheel
   with the purple arrow. Right column: the arrow plane (the blue chain, the orange total arrow, the grey origin), the total and the verdict.
   Colours (video-wide): blue = the signal / the scaled arrows, purple = the test arrow, orange = the total, green = a match, grey = none.
   Every number comes from A9.chain / A9.W8 (common.js) and is asserted below. update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, clamp, ease: E } = V;
  const TAU = A9.TAU;
  const round6 = (v) => Math.round(v * 1e6) / 1e6;

  // ---------- the numbers, from the real algorithm ----------
  const ch1 = A9.chain(1); // spin once: a match
  const ch2 = A9.chain(2); // spin twice: no match
  const CH = [null, ch1, ch2];
  const X = A9.W8.x;

  // ---------- the timeline (local seconds) ----------
  const SWEEP = [
    { t0: 3.0, per: 0.45 }, // run 1: 3.0 to 6.6
    { t0: 9.4, per: 0.4 }, // run 2: 9.4 to 12.6
  ];
  const T = {
    tag: [0.2, 0.6],
    curve: [0.4, 1.2],
    dot0: 1.0, // the eight dots pop 0.1 s apart
    wheel: [1.8, 2.3],
    wheelArrow: [1.9, 2.3],
    plane: [2.4, 2.8],
    origin: [2.7, 3.1],
    total: [6.8, 7.6],
    stat1: [7.4, 7.8],
    match: [7.8, 8.2],
    reset: [8.2, 8.8], // the first run's chain, total, number and verdict fade out; the test arrow shrinks
    spins2: [8.9, 9.25], // the tag becomes 'test: 2 spins' and pops again
    wheel2: [9.0, 9.35], // the test arrow comes back
    ring: [12.6, 13.0],
    stat2: [12.8, 13.2],
    nomatch: [13.0, 13.4],
  };
  const CAPS = [
    [1.2, 2.9, "Take 8 samples of a wave."],
    [3.2, 5.2, "Each sample scales a spinning arrow."],
    [6.8, 8.7, "Right speed: the arrows line up and add."],
    [9.4, 11.0, "Now spin twice instead."],
    [11.4, 13.2, "The arrows loop back and cancel."],
  ];
  const run = (t) => (t < T.spins2[0] ? 1 : 2);
  const curOf = (t, r) => clamp((t - SWEEP[r - 1].t0) / SWEEP[r - 1].per, 0, 8);

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
    // the sweeps end where the storyboard says and the captions follow the picture
    A9.close("scene 4 run 1 ends at 6.6", SWEEP[0].t0 + 8 * SWEEP[0].per, 6.6, 1e-9);
    A9.close("scene 4 run 2 ends at 12.6", SWEEP[1].t0 + 8 * SWEEP[1].per, 12.6, 1e-9);
    const starts = [T.dot0 + 0.1, SWEEP[0].t0 + 0.2, T.total[0], T.spins2[0], SWEEP[1].t0 + 4 * SWEEP[1].per];
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
      T.wheel2[1] <= SWEEP[1].t0 + 1e-9,
      true,
    );
  }

  V.scene({
    kicker: "THE TEST",
    title: ["Test each frequency", "with a spinning arrow"],
    dur: 14,
    caps: CAPS,
    build(stage) {
      check();
      // ---- left column: the samples, the test tag, the wheel ----
      const sTag = A9.tag(stage, { x: 0, y: 0, text: "8 samples", tone: "blue" });
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
      const testTag = A9.tag(stage, { x: 0, y: 292, text: "test: 1 spin", tone: "purple", solid: true });
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
          text: r === 1 ? "test: 1 spin" : "test: 2 spins",
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

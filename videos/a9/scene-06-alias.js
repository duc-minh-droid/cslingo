/* Phase 9 · Fourier Transform & FFT (algo-9), scene 06: "Sample too slowly, and a wave lies" (12.5 s).
   A 7 Hz cosine is sampled 8 times in one second. The 8 dots lie exactly on a 1 Hz cosine too (red dashed), so the spectrum of the dots shows
   1 Hz and nothing can say it was a fake: 7 Hz is beyond half the sample rate (the red wall at 4 Hz), so it folds back (8 - 7 = 1). The cure is to
   sample faster: 8 more dots (green) make 16 a second, the wall moves to 8 Hz and the bar stays at 7 Hz (solid green).
   Top: the time panel (blue wave, dots, red twin). Bottom: the frequency panel (limit wall and red zone, the true 7 Hz bar as a dashed ghost,
   the measured red bar at 1 Hz, the purple fold arrow). Every number comes from A9.ALIAS and the real DFT of the dots (common.js), asserted below;
   the two bar heights are the DFT's own (2 |X[k]| / N), not typed. update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, lerp, ease: E } = V;
  const A = A9.ALIAS;
  const lin = E.lin;

  // ---------- the numbers, from the real algorithm ----------
  const D8 = A.dots(A.fs); // the 8 samples in one second
  const D16 = A.dots(A.fix.fs); // 16 samples in one second
  const NEW = D16.filter((d) => d.n % 2); // the 8 new dots, between the old ones (the old ones are the even n)
  // the spectrum of a set of dots: bar k = 2 |X[k]| / N (a whole cosine of strength 1 has height 1), for k = 0 .. N / 2
  const spectrum = (dots) => {
    const n = dots.length;
    return A9.mags(A9.dft(dots.map((d) => d.y)))
      .slice(0, n / 2 + 1)
      .map((m, k) => (k === 0 || k === n / 2 ? 1 : 2) * (m / n));
  };
  const peakOf = (s) => s.reduce((best, v, k) => (v > s[best] ? k : best), 0);
  const S8 = spectrum(D8);
  const S16 = spectrum(D16);
  const MEASURED = S8[A.fold]; // the red bar at 1 Hz
  const TRUE_BAR = S16[A.f]; // the green bar at 7 Hz

  // ---------- layout (stage px) ----------
  const TAG_X = [0, 204, 590]; // the tag row at y 0: wave, samples, impostor (the samples tag hops wider: 14 px clear of the wave tag)
  const TP = { x: 0, y: 70, w: 936, h: 262, view: [-0.03, 1.03, -1.3, 1.3] }; // the time panel, to y 332
  const FP = { x: 0, y: 362, w: 936, h: 258, view: [0, 8.6, 0, 1.75] }; // the frequency panel, to y 620 (its lip to 626)
  const PAD = { l: 24, r: 24, t: 20, b: 56 };
  const HZ_ROW = 484; // the tags beside the wall and the bars, under the fold arrow
  const FIX_TAG_Y = 376; // 'limit: 8 Hz', above the green bar
  const GAP = 14; // between a tag and the wall

  // ---------- the timeline (local seconds) ----------
  const T = {
    panel: [0.2, 0.8],
    wave: [0.4, 1.6],
    dot0: 1.6, // the 8 dots pop 0.1 s apart
    fsTag: [1.7, 2.1],
    twin: [2.8, 3.8], // the red pen moves at a steady speed, so it meets dot n at 2.8 + n / 8
    twinTag: [3.4, 3.8],
    rings: [4.5, 4.9], // the rings round the 8 dots fade
    fPanel: [5.3, 5.8],
    wall: [5.5, 6.1],
    limitTag: [5.7, 6.1],
    ghost: [6.4, 7.2],
    trueTag: [6.8, 7.2], // 'true' beside the dashed ghost bar
    arrow: [7.2, 8.1],
    measured: [8.0, 8.7],
    shownTag: [8.2, 8.6], // 'DFT shows 1 Hz' beside the red bar
    gone: [9.5, 9.9], // the twin, the impostor tag, the fold arrow, the red bar and the red tags fade
    slide: [9.5, 10.3], // the wall and the red zone move from 4 Hz to 8 Hz
    dot1: 9.8, // the 8 new dots pop 0.1 s apart; the sample tag changes
    fill: [10.4, 10.9], // the ghost fills in solid green
    ring: [10.8, 11.2],
    limit8: [10.4, 10.9],
    shows7: [10.4, 10.9], // 'DFT shows 7 Hz' beside the green bar
  };
  const CAPS = [
    [1.7, 3.2, `Take ${A.fs} samples in one second.`],
    [3.4, 5.3, `The dots fit a ${A.twin} Hz wave too.`], // held 0.2 s longer than the storyboard: 8 words need 1.9 s
    [5.7, 7.3, "Half the sample rate is the limit."],
    [7.5, 9.3, `So ${A.f} Hz folds back onto ${A.fold} Hz.`],
    [9.9, 11.9, "Sample faster than twice the wave."],
  ];

  function check() {
    A9.same("scene 6 fold", [A.fold, A.nyquist, A.fix.fold, A.fix.nyquist], [1, 4, 7, 8]);
    A9.close("scene 6 dots lie on the twin", D8[3].y, A.twinWave(3 / 8), 1e-9);
    D8.forEach((d) => A9.close(`scene 6 dot ${d.n} lies on the 1 Hz twin`, d.y, A.twinWave(d.t), 1e-9));
    D8.forEach((d) => A9.close(`scene 6 dot ${d.n} lies on the 7 Hz wave`, d.y, A.wave(d.t), 1e-9));
    NEW.forEach((d) => A9.close(`scene 6 new dot ${d.n} lies on the 7 Hz wave`, d.y, A.wave(d.t), 1e-9));
    NEW.forEach((d) => {
      if (!(Math.abs(d.y - A.twinWave(d.t)) > 0.5))
        throw new Error(`VID.a9: scene 6 new dot ${d.n} should NOT lie on the 1 Hz twin`);
    });
    A9.same(
      "scene 6 the 16 dots are the 8 old ones plus the 8 new ones, in order",
      [D8.map((d) => d.t), NEW.map((d) => d.t)].flat().sort((a, b) => a - b),
      D16.map((d) => d.t),
    );
    A9.same("scene 6 the dots are 1/8 and 1/16 of a second apart", [D8[1].t, D16[1].t], [1 / 8, 1 / 16]);
    // what the DFT of the dots really shows
    A9.same("scene 6 eight samples a second: the one bar is at", peakOf(S8), A.fold);
    A9.same("scene 6 sixteen samples a second: the one bar is at", peakOf(S16), A.fix.fold);
    A9.close("scene 6 the measured bar has height 1", MEASURED, 1, 1e-9);
    A9.close("scene 6 the true bar has height 1", TRUE_BAR, 1, 1e-9);
    S8.forEach((v, k) => A9.close(`scene 6 8 a second: bar ${k}`, v, k === A.fold ? 1 : 0, 1e-9));
    S16.forEach((v, k) => A9.close(`scene 6 16 a second: bar ${k}`, v, k === A.fix.fold ? 1 : 0, 1e-9));
    // the rule on the screen: the limit is half the sample rate, and 7 Hz is beyond one limit and inside the other
    A9.same("scene 6 the limits are half the sample rates", [A.fs / 2, A.fix.fs / 2], [A.nyquist, A.fix.nyquist]);
    A9.same(
      "scene 6 7 Hz is above the first limit and below the second",
      [A.f > A.nyquist, A.f < A.fix.nyquist],
      [true, true],
    );
    A9.same(
      "scene 6 the fix samples faster than twice the wave, the first rate does not",
      [A.fix.fs > 2 * A.f, A.fs > 2 * A.f],
      [true, false],
    );
    A9.same("scene 6 folding: 8 - 7 = 1", A.fs - A.f, A.fold);
    // the bars and the tags fit their panels' windows
    if (!(MEASURED < FP.view[3] - 0.5)) throw new Error("VID.a9: scene 6 the bars leave the frequency panel");
    // each caption starts as the picture it names appears (never before it, and within 0.7 s of it)
    const starts = [T.dot0, T.twin[0], T.wall[0], T.arrow[0], T.dot1];
    A9.same("scene 6 the tag texts are the DFT's own bars", [A.fold, A.fix.fold], [1, 7]);
    A9.same(
      "scene 6 every caption starts after its picture does",
      CAPS.map((c, i) => c[0] >= starts[i] - 1e-9 && c[0] - starts[i] < 0.7),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 6 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
    A9.same("scene 6 the red bar is done before the fix starts", T.measured[1] < T.gone[0], true);
    A9.same("scene 6 the fix tags are gone before the new dots pop", T.gone[1] <= T.dot1 + 0.2, true);
  }

  V.scene({
    kicker: "ALIASING",
    title: ["Sample too slowly,", "and a wave lies"],
    dur: 12.5,
    caps: CAPS,
    build(stage) {
      check();
      const sampleText = (fs) => `${fs} samples a second`;
      const limitText = (hz) => `limit: ${hz} Hz`;

      // ---- the tag row ----
      const waveTag = A9.tag(stage, { x: TAG_X[0], y: 0, text: `${A.f} Hz wave`, tone: "blue" });
      const rateTag = A9.tag(stage, { x: TAG_X[1], y: 0, text: sampleText(A.fs), tone: "blue", solid: true });
      const twinTag = A9.tag(stage, { x: TAG_X[2], y: 0, text: `looks like ${A.fold} Hz`, tone: "red", solid: true });

      // ---- the time panel: the 7 Hz wave, its 1 Hz impostor, the dots ----
      const T1 = A9.plot(stage, {
        x: TP.x,
        y: TP.y,
        w: TP.w,
        h: TP.h,
        view: TP.view,
        axes: "mid",
        pad: PAD,
        xticks: [0, { v: 1, text: "1 s" }],
      });
      const wave = T1.curve(A.wave, { tone: "blue", w: 4, x0: 0, x1: 1, n: 400 });
      const twin = T1.curve(A.twinWave, { tone: "red", w: 6, x0: 0, x1: 1, dash: "14 10" });
      const dots = T1.dots({ max: D8.length + NEW.length, r: 11 });

      // ---- the frequency panel: the limit, the true bar, the measured bar ----
      const F = A9.plot(stage, {
        x: FP.x,
        y: FP.y,
        w: FP.w,
        h: FP.h,
        view: FP.view,
        axes: "bottom",
        pad: PAD,
        xticks: [0, 1, 2, 3, 4, 5, 6, 7, { v: A.fix.nyquist, text: `${A.fix.nyquist} Hz` }], // the unit is written once, at the end
      });
      const zone = F.band({ tone: "red" });
      const wall = F.vline({ tone: "red", w: 5, dash: "10 8" });
      const bars = F.bars({ max: 3, bw: 40 });

      // the fold arrow: an arch over the gap, from the 7 Hz bar to the 1 Hz bar
      const ov = A9.svg(stage);
      const tip = F.py(TRUE_BAR) - 12;
      const fold = ov.appendChild(
        A9.arrow(F.px(A.f), tip, F.px(A.fold), tip, "purple", 1, { w: 7, head: 22, bow: -58 }),
      );

      // the tags beside the wall and the bars (their widths are estimates; the wall and the bars stay 14 px clear)
      const HALF_BAR = 20; // half the width of a bar (bw 40)
      const limitTag = A9.tag(stage, { x: F.px(A.nyquist) + GAP, y: HZ_ROW, text: limitText(A.nyquist), tone: "red" });
      const shownText = (hz) => `DFT shows ${hz} Hz`;
      const shownTag = A9.tag(stage, {
        x: F.px(A.fold) + HALF_BAR + GAP,
        y: HZ_ROW,
        text: shownText(A.fold),
        tone: "red",
        solid: true,
      }); // what the DFT reports for the eight dots (the red bar)
      const trueTag = A9.tag(stage, { x: F.px(A.f) + HALF_BAR + 12, y: HZ_ROW, text: "true", tone: "orange" }); // the wave that was really there (the dashed bar)
      const shows7Tag = A9.tag(stage, {
        x: F.px(A.f) - HALF_BAR - 40 - A9.tagW(shownText(A.fix.fold)), // clear of the green ring round the bar (the width estimate is about 14 px short)
        y: HZ_ROW,
        text: shownText(A.fix.fold),
        tone: "green",
        solid: true,
      }); // after the fix the DFT tells the truth
      const limit8Tag = A9.tag(stage, {
        x: F.px(A.fix.nyquist) - GAP - A9.tagW(limitText(A.fix.nyquist)),
        y: FIX_TAG_Y,
        text: limitText(A.fix.nyquist),
        tone: "green",
      });

      return (t) => {
        const gone = 1 - ramp(t, T.gone[0], T.gone[1], lin); // everything red and wrong fades with this
        const slide = E.inOut(ramp(t, T.slide[0], T.slide[1], lin));
        const wallX = lerp(A.nyquist, A.fix.nyquist, slide);
        const fixed = t >= T.dot1;

        // ---- the tag row ----
        waveTag.set({ k: ramp(t, T.panel[0], T.panel[1], lin) });
        rateTag.set({
          text: sampleText(fixed ? A.fix.fs : A.fs),
          tone: fixed ? "green" : "blue",
          k: ramp(t, T.fsTag[0], T.fsTag[1], lin),
          s: 1 + 0.08 * (flash(t, T.limitTag[0], T.limitTag[0] + 0.5) + flash(t, T.dot1, T.dot1 + 0.4)), // it hops when 'the sample rate' is named
        });
        twinTag.set({ k: ramp(t, T.twinTag[0], T.twinTag[1], lin), o: gone });

        // ---- the time panel ----
        const kp = ramp(t, T.panel[0], T.panel[1], lin);
        T1.set({ o: Math.min(1, kp * 3), s: 0.96 + 0.04 * E.pop(kp) });
        wave.set({ k: ramp(t, T.wave[0], T.wave[1], E.inOut) });
        twin.set({ k: ramp(t, T.twin[0], T.twin[1], lin), o: gone });
        const ringsOn = 1 - ramp(t, T.rings[0], T.rings[1], lin);
        dots.set([
          ...D8.map((d) => {
            const k = A9.seq(t, T.dot0, 0.1, 0.35, d.n); // the old dots pop in time order
            const meet = T.twin[0] + d.t * (T.twin[1] - T.twin[0]); // the red pen reaches this dot
            const hit = ramp(t, meet, meet + 0.25, lin);
            return {
              x: d.t,
              y: d.y,
              o: Math.min(1, k * 4),
              s: 0.5 + 0.5 * E.pop(k),
              ring: "red",
              ringK: hit * ringsOn,
            };
          }),
          ...NEW.map((d, j) => {
            const k = A9.seq(t, T.dot1, 0.1, 0.3, j);
            return { x: d.t, y: d.y, tone: "green", o: Math.min(1, k * 4), s: 0.5 + 0.5 * E.pop(k) };
          }),
        ]);

        // ---- the frequency panel ----
        const kf = ramp(t, T.fPanel[0], T.fPanel[1], lin);
        F.set({ o: Math.min(1, kf * 3), s: 0.96 + 0.04 * E.pop(kf) });
        const kw = ramp(t, T.wall[0], T.wall[1], E.inOut);
        wall.set({ x: wallX, k: kw });
        zone.set({ x0: wallX, x1: FP.view[1], o: kw });
        const fill = ramp(t, T.fill[0], T.fill[1], E.out);
        bars.set([
          {
            x: A.f,
            v: TRUE_BAR,
            ghost: true,
            tone: "orange",
            k: E.out(ramp(t, T.ghost[0], T.ghost[1], lin)),
            o: 1 - ramp(t, T.fill[0] + 0.2, T.fill[1], lin),
          },
          {
            x: A.f,
            v: TRUE_BAR,
            tone: "green",
            k: fill,
            ring: "green",
            ringK: ramp(t, T.ring[0], T.ring[1], lin),
          },
          {
            x: A.fold,
            v: MEASURED,
            tone: "red",
            k: E.out(ramp(t, T.measured[0], T.measured[1], lin)),
            o: gone,
          },
        ]);
        A9.drawOn(fold, ramp(t, T.arrow[0], T.arrow[1], E.inOut));
        V.show(fold, gone);
        limitTag.set({ k: ramp(t, T.limitTag[0], T.limitTag[1], lin), o: gone });
        shownTag.set({ k: ramp(t, T.shownTag[0], T.shownTag[1], lin), o: gone });
        trueTag.set({ k: ramp(t, T.trueTag[0], T.trueTag[1], lin), o: gone });
        shows7Tag.set({ k: ramp(t, T.shows7[0], T.shows7[1], lin) });
        limit8Tag.set({ k: ramp(t, T.limit8[0], T.limit8[1], lin) });
      };
    },
  });
})();

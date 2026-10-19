/* Phase 9 · Fourier Transform & FFT (algo-9), scene 07: "Cut a wave mid-cycle, and the bars leak" (12 s).
   IDEA (leakage): the DFT behaves as if its window repeated for ever. A window holding a whole number of cycles joins its copy smoothly and the
   energy lands in ONE bar; half a cycle extra leaves a jump where the window meets its copy, a jump needs many frequencies, and the energy leaks
   into neighbouring bars. Fading the ends with a smooth bell (the Hann window) removes the jump, so the leak shrinks.
   Real numbers: N = 64 samples, a cosine of 8 whole cycles, then 8.5 cycles (A9.LEAK in common.js, asserted there and again below).
   TOP PANEL: the blue wave in its window (x 0..1, bracket 'window') and a faded copy (x 1..2, bracket 'a copy'); the red line at the seam joins the
   END of the window to the START of the copy, so its length is the real jump (0, then 2, then 0 again once the ends are faded).
   BOTTOM PANEL: bars 0..20 of the real DFT (height = 2 |X| / N): orange for the two bars the wave sits between, red for the leak.
   Colours: blue = the signal, orange = the frequency side, purple = the window / the bell, red = the jump and the leak, green = clean.
   Timeline (local seconds): 0.2 top panel, 0.3 tag, 0.4-1.3 the wave draws, 0.9-1.5 'window' bracket, 1.1-1.8 the copy draws, 1.4-1.9 'a copy',
   1.5-1.9 bar panel, 1.7-2.5 the one clean bar grows, 3.6-4.6 f 8 -> 8.5 (the wave slides, the bars morph), 4.1-4.7 the red seam draws on,
   4.4 'jump' and '8.5 cycles', 6.5-6.9 'leak' tag (the seam pulses 6.6-7.1, then the red bars swell in a ripple from 7.0),
   8.7-9.3 the bells draw on, 8.9 'Hann window', 9.2-10.4 the wave tapers and the leak shrinks, 10.4-12 hold.
   Captions follow the picture (the storyboard's came earlier than the bars, the seam and the bell): each starts when what it names is on screen
   (asserted below). Every number comes from A9.LEAK; update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, lerp, clamp, ease: E } = V;
  const LK = A9.LEAK;
  const TAU = A9.TAU;
  const lin = E.lin;

  // ---------- when things happen (local seconds) ----------
  const TL = {
    panel: [0.2, 0.6],
    tag: [0.3, 0.8],
    wave: [0.4, 1.3],
    win: [0.9, 1.5],
    copy: [1.1, 1.8],
    copyLbl: [1.4, 1.9],
    freq: [1.5, 1.9],
    bars: [1.7, 2.5],
    slide: [3.6, 4.6], // f: 8 -> 8.5 cycles
    seam: [4.1, 4.7],
    half: 4.4, // the jump tag pops and the main tag reads '8.5 cycles'
    leak: [6.5, 6.9],
    pulse: [6.6, 7.1],
    ripple: 7.0, // each red bar swells for a moment, from the middle outwards (0.09 s apart)
    bell: [8.7, 9.3],
    hann: 8.9, // the main tag reads 'Hann window'
    fade: [9.2, 10.4], // g: 0 -> 1 (how much window)
  };
  const CAPS = [
    [1.5, 2.9, "The DFT repeats the window."], // says why the copy is there
    [3.0, 4.4, "Whole cycles join: one clean bar."],
    [4.5, 6.6, "Half a cycle more: the ends do not meet."],
    [6.7, 8.6, "The jump needs many frequencies: the bars leak."],
    [9.3, 11.4, "A smooth fade at both ends shrinks the leak."], // the fade is the Hann window, named by its tag
  ];
  const fOf = (t) => lerp(LK.whole, LK.half, ramp(t, TL.slide[0], TL.slide[1], E.inOut)); // cycles in the window
  const gOf = (t) => ramp(t, TL.fade[0], TL.fade[1], E.inOut); // how much Hann window

  // ---------- layout (stage px) ----------
  const SIG = { x: 0, y: 64, w: 936, h: 250, pad: { l: 24, r: 24, t: 16, b: 20 } }; // inner area y 80-294
  const SIG_VIEW = [0, 2, -1.75, 1.4]; // data x 0..1 is the window, 1..2 its copy (444 px each); 68 px per data unit
  const BRACKET = { y: -1.574, hook: -1.4 }; // the dimension line under the wave (stage y 282, hooks up to 270)
  const FRQ = { x: 0, y: 340, w: 936, h: 280, pad: { l: 24, r: 24, t: 16, b: 56 } }; // inner area y 356-564
  const BARS = 21; // bars 0..20, 42 px apart
  const LEAK_TAG = { x: 560, y: 462 }; // above the small red stubs on the right of the pair

  // a moving swell for the red bars: bar k swells at ripple + 0.09 x its distance from the pair
  const swell = (t, k) => {
    const d = Math.abs(k - 8.5) - 0.5;
    return flash(t, TL.ripple + 0.09 * d, TL.ripple + 0.09 * d + 0.4);
  };
  const spans = (n) => Array.from({ length: n }, (_, k) => k);
  const bell = (u) => 0.5 - 0.5 * Math.cos(TAU * u); // the Hann window across the window

  function check() {
    A9.same(
      "scene 7 seam",
      [LK.seam(8), LK.seam(8.5)],
      [
        [1, 1],
        [-1, 1],
      ],
    );
    // the red line is the real jump: end of the window against the start of its copy
    A9.closeAll("scene 7 whole cycles: no jump", [LK.sig(8, 1, 0), LK.sig(8, 0, 0)], [1, 1], 1e-9);
    A9.closeAll("scene 7 half a cycle more: the jump is 2", [LK.sig(8.5, 1, 0), LK.sig(8.5, 0, 0)], [-1, 1], 1e-9);
    A9.closeAll("scene 7 faded ends meet at zero", [LK.sig(8.5, 1, 1), LK.sig(8.5, 0, 1)], [0, 0], 1e-9);
    // what the bars show at each stage
    const [t1, t2, t3] = [3.5, 6, 11.9];
    A9.same(
      "scene 7 the timeline reaches 8, then 8.5, then the full window",
      [fOf(t1), fOf(t2), gOf(t1), gOf(t3)],
      [8, 8.5, 0, 1],
    );
    const s1 = LK.spec(fOf(t1), gOf(t1));
    A9.closeAll(
      "scene 7 whole cycles: one bar at 8",
      s1.slice(0, BARS),
      spans(BARS).map((k) => (k === 8 ? 1 : 0)),
      1e-9,
    );
    const s2 = LK.spec(fOf(t2), gOf(t2));
    A9.closeAll("scene 7 8.5 cycles: bars 8 and 9", [s2[8], s2[9]], [0.622, 0.651], 0.002);
    A9.closeAll("scene 7 8.5 cycles: the skirt (bars 2, 5, 12)", [s2[2], s2[5], s2[12]], [0.037, 0.077, 0.105], 0.002);
    const s3 = LK.spec(fOf(t3), gOf(t3));
    A9.closeAll("scene 7 Hann: bars 7 to 10", s3.slice(7, 11), [0.09, 0.42, 0.42, 0.09], 0.005);
    spans(BARS).forEach((k) => {
      if (k < 6 || k > 11) A9.same(`scene 7 Hann: bar ${k} is below 0.013`, s3[k] < 0.013, true);
    });
    A9.same("scene 7 the leak is real before the window and small after", [s2[5] > 0.05, s3[5] < 0.013], [true, true]);
    A9.same("scene 7 the tags say the numbers of the DFT", [LK.whole, LK.half], [8, 8.5]);
    // captions follow the picture, never overlap and are short enough to read
    const starts = [TL.copyLbl[0], TL.bars[1], TL.half, TL.leak[0], TL.fade[0]];
    A9.same(
      "scene 7 every caption starts after its picture does",
      CAPS.map((c, i) => c[0] >= starts[i] && c[0] - starts[i] < 0.6),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 7 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
  }

  // the first fraction k of a polyline's length (px-weighted), so a bracket draws on smoothly
  function partial(P, pts, k) {
    const seg = pts.slice(1).map((p, i) => Math.hypot((p[0] - pts[i][0]) * P.cur.sx, (p[1] - pts[i][1]) * P.cur.sy));
    let left = clamp(k) * seg.reduce((a, b) => a + b, 0);
    const out = [pts[0]];
    for (let i = 0; i < seg.length && left > 0; i++) {
      const w = Math.min(1, left / seg[i]);
      out.push([lerp(pts[i][0], pts[i + 1][0], w), lerp(pts[i][1], pts[i + 1][1], w)]);
      left -= seg[i];
    }
    return out;
  }
  // a dimension line under the wave in two halves, each drawn from its hook towards the label that sits in the gap between them
  const GAP = 0.14; // half the gap, in window widths (about 62 px)
  const halves = (x0, x1) => [
    [
      [x0, BRACKET.hook],
      [x0, BRACKET.y],
      [(x0 + x1) / 2 - GAP, BRACKET.y],
    ],
    [
      [x1, BRACKET.hook],
      [x1, BRACKET.y],
      [(x0 + x1) / 2 + GAP, BRACKET.y],
    ],
  ];

  V.scene({
    kicker: "LEAKAGE",
    title: ["Cut a wave mid-cycle,", "and the bars leak"],
    dur: 12,
    caps: CAPS,
    build(stage) {
      check();
      // ---- top: the wave in its window, and the copy that follows it ----
      const T = A9.plot(stage, { ...SIG, view: SIG_VIEW, axes: "mid" });
      const copy = T.curve(() => 0, { tone: "blue", w: 5, n: 500, x0: 1, x1: 2 });
      const wave = T.curve(() => 0, { tone: "blue", w: 5, n: 500, x0: 0, x1: 1 });
      const bells = [
        [0, 1, 1],
        [0, 1, -1],
        [1, 2, 1],
        [1, 2, -1],
      ].map(([x0, x1, sign]) => ({
        x0,
        sign,
        c: T.curve(() => 0, { tone: "purple", w: 5, n: 120, dash: "10 8", x0, x1 }),
      }));
      const glow = T.vline({ tone: "red", w: 16, dash: "" });
      const seam = T.vline({ tone: "red", w: 6, dash: "" });
      const winBr = [0, 1].map(() => T.path({ tone: "purple", w: 4 }));
      const copyBr = [0, 1].map(() => T.path({ tone: "grey", w: 4 }));
      const winLbl = T.text({ tone: "purple" });
      const copyLbl = T.text({ tone: "grey" });

      // ---- bottom: the real bars ----
      const F = A9.plot(stage, {
        ...FRQ,
        view: [-0.5, BARS - 0.5, 0, 1.15],
        axes: "bottom",
        xticks: [0, 8, 16], // few numbers, so 'bar number' fits between them
      });
      const bars = F.bars({ max: BARS, bw: 28 });

      // ---- tags ----
      const barNo = F.text({ tone: "grey", px: true }); // says what the numbers under the bars are
      const main = A9.tag(stage, { x: 0, y: 0, text: `${LK.whole} whole cycles`, tone: "green" });
      const jump = A9.tag(stage, { x: 419, y: 0, text: "jump", tone: "red", solid: true }); // centred on the seam (stage x 468)
      const leak = A9.tag(stage, { ...LEAK_TAG, text: "leak", tone: "red", solid: true });
      const STATES = [
        { text: `${LK.whole} whole cycles`, tone: "green", solid: false },
        { text: `${LK.half} cycles`, tone: "red", solid: true },
        { text: "Hann window", tone: "purple", solid: true },
      ];

      return (t) => {
        const f = fOf(t);
        const g = gOf(t);

        // ---- the top panel: the window, its copy, the jump between them ----
        const pop = ramp(t, TL.panel[0], TL.panel[1], lin);
        T.set({ o: Math.min(1, pop * 3), s: 0.96 + 0.04 * E.pop(pop) });
        wave.set({ fn: (x) => LK.sig(f, x, g), k: ramp(t, TL.wave[0], TL.wave[1], E.inOut) });
        copy.set({ fn: (x) => LK.sig(f, x - 1, g), k: ramp(t, TL.copy[0], TL.copy[1], E.inOut), o: 0.45 });

        const wk = ramp(t, TL.win[0], TL.win[1], E.out);
        halves(0.015, 0.985).forEach((pts, i) => winBr[i].set({ pts: partial(T, pts, wk) }));
        winLbl.set({ text: "window", x: 0.5, y: BRACKET.y, dy: 10, o: Math.min(1, wk * 3) });
        const ck = ramp(t, TL.copyLbl[0], TL.copyLbl[1], E.out);
        halves(1.015, 1.985).forEach((pts, i) => copyBr[i].set({ pts: partial(T, pts, ck) }));
        copyLbl.set({ text: "a copy", x: 1.5, y: BRACKET.y, dy: 10, o: Math.min(1, ck * 3) });

        // the red line joins the end of the window to the start of its copy: its length is the jump
        const [top, bottom] = [LK.sig(f, 0, g), LK.sig(f, 1, g)];
        const sk = ramp(t, TL.seam[0], TL.seam[1], E.inOut);
        seam.set({ x: 1, y1: top, y0: bottom, k: sk, o: 1 - g });
        glow.set({ x: 1, y1: top, y0: bottom, k: sk, o: 0.3 * flash(t, TL.pulse[0], TL.pulse[1]) * (1 - g) });

        // the bell: what the window is multiplied by (the wave will fit under it)
        const bk = ramp(t, TL.bell[0], TL.bell[1], E.inOut);
        bells.forEach(({ x0, sign, c }) => c.set({ fn: (x) => sign * bell(x - x0), k: bk, o: x0 === 0 ? 0.9 : 0.55 }));

        // ---- the bottom panel: bar k says how much of 'k whole cycles in the window' is there ----
        const fp = ramp(t, TL.freq[0], TL.freq[1], lin);
        F.set({ o: Math.min(1, fp * 3), s: 0.96 + 0.04 * E.pop(fp) });
        const spec = LK.spec(f, g);
        const grow = E.out(ramp(t, TL.bars[0], TL.bars[1], lin));
        bars.set(
          spans(BARS).map((k) => ({
            x: k,
            v: spec[k],
            k: grow,
            tone: k === 8 || k === 9 ? "orange" : "red",
            w: 28 + 8 * (k === 8 || k === 9 ? 0 : swell(t, k)),
            o: spec[k] > 0.004 ? 1 : 0,
          })),
        );

        barNo.set({
          text: "bar number",
          x: F.px(4),
          y: F.area.y + F.area.h + 34,
          o: ramp(t, TL.freq[0], TL.freq[1], lin),
        });

        // ---- the tags ----
        const phase = t < TL.half ? 0 : t < TL.hann ? 1 : 2; // 8 whole cycles, 8.5 cycles, Hann window: each pops in as it replaces the last
        const born = [TL.tag[0], TL.half, TL.hann][phase];
        main.set({ ...STATES[phase], k: ramp(t, born, born + (phase ? 0.4 : 0.5), lin) });
        jump.set({ k: ramp(t, TL.half, TL.half + 0.4, lin), o: 1 - g });
        leak.set({ k: ramp(t, TL.leak[0], TL.leak[1], lin), o: 1 - g });
      };
    },
  });
})();

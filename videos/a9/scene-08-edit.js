/* Phase 9 · Fourier Transform & FFT (algo-9), scene 08: "Edit the bars, then go back" (11.5 s).
   IDEA: a hum that is mixed through a whole recording is just ONE PAIR of bars in the frequency picture. Do the DFT, delete the hum's bar AND its
   mirror (k and N - k), go back with the inverse DFT, and the hum is gone while the slow wave is untouched.
   Real numbers: 128 samples, a slow wave on bar 3 (strength 1) plus a hum on bar 15 (strength 0.4); the mirrors are 125 and 113 (A9.HUM in
   common.js, asserted there and again below from the real DFT: |X[3]| = |X[125]| = 64, |X[15]| = |X[113]| = 25.6).
   LAYOUT: the same way round as scenes 2 to 7 (the signal panel on top, the bars under it), so the DFT arrow points DOWN and the inverse
   arrow points UP (the storyboard stacked them the other way round). Top: the wave (blue) with a red copy of the hum on its axis while the hum
   is the subject; right-hand tag column. Bottom: the four spikes, red rings and a purple arch on the pair, then two crosses over dashed ghosts.
   Colours: blue = the wiggle, orange = the bars, purple = the DFT / inverse arrows and the arch, red = the hum and what is deleted,
   green = the clean wave.
   Timeline (local seconds): 0.2 top panel, 0.4-1.6 the wave draws, 1.4 'with a hum', 1.8-2.4 the DFT arrow, 2.0 'DFT', 2.4 bar panel,
   2.6-3.6 the four spikes grow, 3.6-4.0 red rings on the short pair, 3.7-4.7 the hum itself draws on the wave, 3.9 'the hum', 4.2-4.9 the arch,
   6.0-7.0 the pair shrinks to nothing (rings, arch, tag and the red hum fade), 6.4-7.0 two crosses, 6.6-7.2 dashed ghosts,
   7.4-8.0 the inverse arrow, 7.6 'inverse DFT', 8.2-9.4 the hum drains out of the wave, 9.3-9.7 blue to green, 9.5 'clean', 9.9-11.5 hold.
   Captions follow the picture: each starts when what it names is on screen (asserted below). update(t) is pure. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, ease: E } = V;
  const H = A9.HUM;
  const lin = E.lin;

  // ---------- when things happen (local seconds) ----------
  const TL = {
    panel: [0.2, 0.6],
    wave: [0.4, 1.6],
    withTag: [1.4, 1.8],
    dft: [1.8, 2.4], // the DFT arrow draws on, the 'DFT' tag pops 0.2 s later
    freq: [2.4, 2.8],
    spikes: 2.6, // the four spikes grow 0.12 s apart, 0.64 s each
    rings: [3.6, 4.0],
    hum: [3.7, 4.7], // the hum alone draws on the wave
    humTag: [3.9, 4.3],
    arch: [4.2, 4.9],
    del: [6.0, 7.0], // the pair shrinks, the marks fade
    crosses: [6.4, 7.0],
    ghosts: [6.6, 7.2],
    inv: [7.4, 8.0], // the inverse arrow draws on, the 'inverse DFT' tag pops 0.2 s later
    drain: [8.2, 9.4], // g: 1 -> 0, how much hum is left in the wave
    green: [9.3, 9.7], // the blue wave hands over to the green one (they are the same curve by now)
    cleanTag: 9.5,
  };
  const CAPS = [
    [2.6, 4.2, "The DFT turns the wiggle into bars."],
    [4.2, 5.9, "The hum is one pair of bars."],
    [6.0, 7.6, "Delete both bars."],
    [8.4, 10.6, "Go back: the hum is gone."],
  ];
  const delOf = (t) => ramp(t, TL.del[0], TL.del[1], E.inOut); // 0 -> 1: how far the pair is deleted
  const gOf = (t) => 1 - ramp(t, TL.drain[0], TL.drain[1], E.inOut); // 1 -> 0: how much hum is left in the wave

  // ---------- layout (stage px) ----------
  const TP = { x: 0, y: 0, w: 936, h: 256, pad: { l: 24, r: 240, t: 20, b: 20 } }; // inner y 20-236, axis at y 128, 67.5 px per unit
  const FP = { x: 0, y: 372, w: 936, h: 254, pad: { l: 24, r: 24, t: 20, b: 56 } }; // inner y 392-570, 142 px per unit
  const SPIKE = 14; // the width of a spike, px
  const COL = 708; // the right-hand tag column of the signal panel
  const ARROW = { from: 274, to: 360, dftX: 200, invX: 530 }; // the two arrows in the gap between the panels: DFT left, inverse right
  const TAG_Y = (ARROW.from + ARROW.to) / 2 - 29; // 288, beside each arrow
  const ARCH = { rise: 40, bow: 50 }; // the arch starts 40 px above the short spikes and peaks 50 px higher
  const hum = H.bars.filter((b) => b.k === H.hum || b.k === H.mirror); // the short pair
  const humH = hum[0].h; // 0.4

  function check() {
    A9.same("scene 8 mirror", [H.hum, H.mirror, H.n - H.hum], [15, 113, 113]);
    A9.same(
      "scene 8 spikes",
      H.bars.map((b) => b.k),
      [3, 15, 113, 125],
    );
    // the bars drawn are the real DFT's of the 128 samples, relative to the tallest
    const d = A9.dft(Array.from({ length: H.n }, (_, i) => H.at(i / H.n)));
    const m = A9.mags(d);
    const top = Math.max(...m);
    H.bars.forEach((b) => A9.close(`scene 8 bar ${b.k} height`, m[b.k] / top, b.h, 1e-9));
    A9.close(
      "scene 8 every other bar is zero",
      m.reduce((s, v, k) => (H.bars.some((b) => b.k === k) ? s : s + v), 0),
      0,
      1e-9,
    );
    A9.close("scene 8 the hum is 0.4 of the slow wave", m[H.hum] / m[H.slow], 0.4, 1e-9);
    // delete bars 15 and 113 (both!) and go back: the pure slow wave, nothing imaginary left
    const gone = (k) => k === H.hum || k === H.mirror;
    const back = A9.idft(
      d.re.map((v, k) => (gone(k) ? 0 : v)),
      d.im.map((v, k) => (gone(k) ? 0 : v)),
    );
    A9.close(
      "scene 8 going back gives the clean wave (largest error)",
      Math.max(...back.re.map((v, i) => Math.abs(v - H.at(i / H.n, 0)))),
      0,
      1e-9,
    );
    A9.close("scene 8 going back leaves nothing imaginary", Math.max(...back.im.map(Math.abs)), 0, 1e-9);
    A9.same("scene 8 the wave at the end is the clean one", [gOf(TL.drain[1]), delOf(TL.del[1])], [0, 1]);
    // captions follow the picture, never overlap and are short enough to read
    const starts = [TL.spikes, TL.arch[0], TL.del[0], TL.drain[0]];
    A9.same(
      "scene 8 every caption starts after its picture does",
      CAPS.map((c, i) => c[0] >= starts[i] && c[0] - starts[i] < 0.6),
      CAPS.map(() => true),
    );
    A9.same(
      "scene 8 captions do not overlap and read at 4.5 words a second or less",
      CAPS.every((c, i) => (i === 0 || c[0] >= CAPS[i - 1][1]) && c[2].split(" ").length / (c[1] - c[0]) <= 4.5),
      true,
    );
  }

  V.scene({
    kicker: "FILTERING",
    title: ["Edit the bars,", "then go back"],
    dur: 11.5,
    caps: CAPS,
    build(stage) {
      check();
      // ---- top: the wiggle (a slow wave with a hum on it) ----
      const T = A9.plot(stage, { ...TP, view: [0, 1, -1.6, 1.6], axes: "mid" });
      const blue = T.curve((x) => H.at(x, 1), { tone: "blue", w: 6, n: 500 });
      const green = T.curve((x) => H.at(x, 0), { tone: "green", w: 6, n: 500 });
      const humOnly = T.curve((x) => H.at(x, 1) - H.at(x, 0), { tone: "red", w: 5, n: 500 });

      // ---- bottom: the bars (the four spikes, then two ghosts where the hum was) ----
      const F = A9.plot(stage, {
        ...FP,
        view: [-1, H.n + 1, 0, 1.25],
        axes: "bottom",
        xticks: H.bars.map((b) => b.k),
      });
      const bars = F.bars({ max: 4, bw: SPIKE });
      const barNo = F.text({ tone: "grey", px: true }); // says what the numbers under the bars are

      // ---- the arrows, the arch and the crosses (our own layer above both panels) ----
      const ov = A9.svg(stage);
      const arrow = (x, y1, y2) => ov.appendChild(A9.arrow(x, y1, x, y2, "purple", 1, { w: 8, head: 22 }));
      const down = arrow(ARROW.dftX, ARROW.from, ARROW.to); // the DFT: time down to bars
      const up = arrow(ARROW.invX, ARROW.to, ARROW.from); // the inverse DFT: bars up to time
      const archY = F.py(humH) - ARCH.rise;
      const arch = ov.appendChild(
        A9.arrow(F.px(H.hum), archY, F.px(H.mirror), archY, "purple", 1, { w: 6, head: 18, bow: ARCH.bow }),
      );
      // the dashed outline of a spike that was there (our own, so the dashes divide the path evenly and end on a dash at both feet)
      const ghosts = hum.map((b) => {
        const [x, top, foot, r] = [F.px(b.k), F.py(b.h), F.py(0), SPIKE / 2];
        const len = 2 * (foot - top - r) + Math.PI * r;
        const dash = len / (2 * Math.round((len / 7 - 1) / 2) + 1);
        return ov.appendChild(
          V.s("path", {
            d: `M${A9.f1(x - r)} ${A9.f1(foot)}L${A9.f1(x - r)} ${A9.f1(top + r)}A${r} ${r} 0 0 1 ${A9.f1(x + r)} ${A9.f1(top + r)}L${A9.f1(x + r)} ${A9.f1(foot)}`,
            fill: "none",
            "stroke-width": "4",
            "stroke-dasharray": `${A9.f1(dash)} ${A9.f1(dash)}`,
            style: { stroke: A9.tone("red").c },
          }),
        );
      });
      const crosses = hum.map((b) => ov.appendChild(A9.cross(F.px(b.k), F.py(humH) - 26, 40, "red", { w: 8 })));

      // ---- tags ----
      const wiggle = A9.tag(stage, { x: COL, y: T.py(0) - 29, text: "with a hum", tone: "blue" });
      const dftTag = A9.tag(stage, { x: ARROW.dftX + 30, y: TAG_Y, text: "DFT", tone: "purple", solid: true });
      const invTag = A9.tag(stage, { x: ARROW.invX + 30, y: TAG_Y, text: "inverse DFT", tone: "purple", solid: true });
      const humTag = A9.tag(stage, {
        x: Math.round((F.px(H.hum) + F.px(H.mirror)) / 2 - A9.tagW("the hum") / 2),
        y: Math.round(archY - ARCH.bow + 22),
        text: "the hum",
        tone: "red",
        solid: true,
      });

      return (t) => {
        const del = delOf(t);
        const g = gOf(t);
        const left = 1 - del; // how much of the hum's marks is still there

        // ---- the signal panel ----
        const pop = ramp(t, TL.panel[0], TL.panel[1], lin);
        T.set({ o: Math.min(1, pop * 3), s: 0.96 + 0.04 * E.pop(pop) });
        const toGreen = ramp(t, TL.green[0], TL.green[1], lin);
        // while the red hum is the subject the whole wave steps back (half strength), then comes forward again
        const focus = ramp(t, TL.hum[0], TL.hum[0] + 0.4, lin) * left;
        blue.set({
          fn: (x) => H.at(x, g),
          k: ramp(t, TL.wave[0], TL.wave[1], E.inOut),
          o: (toGreen >= 1 ? 0 : 1) * (1 - 0.5 * focus), // the green wave fades in on top, so the colour changes with no pale moment
        });
        green.set({ k: 1, o: toGreen });
        humOnly.set({ k: ramp(t, TL.hum[0], TL.hum[1], E.inOut), o: left });
        wiggle.set({
          text: t < TL.cleanTag ? "with a hum" : "clean",
          tone: t < TL.cleanTag ? "blue" : "green",
          solid: t >= TL.cleanTag,
          k:
            t < TL.cleanTag ? ramp(t, TL.withTag[0], TL.withTag[1], lin) : ramp(t, TL.cleanTag, TL.cleanTag + 0.4, lin),
        });

        // ---- the arrows: DFT down, then (later) the inverse back up ----
        A9.drawOn(down, ramp(t, TL.dft[0], TL.dft[1], E.inOut));
        dftTag.set({ k: ramp(t, TL.dft[0] + 0.2, TL.dft[1] + 0.2, lin) });
        A9.drawOn(up, ramp(t, TL.inv[0], TL.inv[1], E.inOut));
        invTag.set({ k: ramp(t, TL.inv[0] + 0.2, TL.inv[1] + 0.2, lin) });

        // ---- the bar panel ----
        const fp = ramp(t, TL.freq[0], TL.freq[1], lin);
        F.set({ o: Math.min(1, fp * 3), s: 0.96 + 0.04 * E.pop(fp) });
        const ringIn = ramp(t, TL.rings[0], TL.rings[1], lin);
        const ghostO = ramp(t, TL.ghosts[0], TL.ghosts[1], lin);
        ghosts.forEach((g) => V.show(g, ghostO));
        bars.set(
          H.bars.map((b, i) => {
            const isHum = b === hum[0] || b === hum[1];
            return {
              x: b.k,
              v: b.h,
              tone: "orange",
              k: E.out(A9.seq(t, TL.spikes, 0.12, 0.64, i)) * (isHum ? left : 1),
              ring: isHum ? "red" : null,
              ringK: isHum ? (ringIn * left) / 3 : 0, // the ring's opacity is 3 x ringK, so it fades with the deletion
            };
          }),
        );

        barNo.set({
          text: "bar number",
          x: (F.px(H.hum) + F.px(H.mirror)) / 2,
          y: F.area.y + F.area.h + 34,
          o: ramp(t, 2.8, 3.3, lin),
        });

        // ---- the pair: arch and tag, then the crosses ----
        A9.drawOn(arch, ramp(t, TL.arch[0], TL.arch[1], E.inOut));
        V.show(arch, left);
        humTag.set({ k: ramp(t, TL.humTag[0], TL.humTag[1], lin), o: left });
        crosses.forEach((c, i) => A9.stamp(c, ramp(t, TL.crosses[0] + 0.1 * i, TL.crosses[1] + 0.1 * i, lin)));
      };
    },
  });
})();

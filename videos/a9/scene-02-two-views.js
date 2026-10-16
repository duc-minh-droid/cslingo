/* Phase 9 · scene 02-two-views (10.5 s): one signal, two descriptions. The wiggle over one second is the sum of a 5 Hz wave (strength 1)
   and a 12 Hz wave (strength 0.5), the defaults of lesson 9.3's mixer; the bars say which waves are inside it. 'Hz' is defined on screen by
   counting the five crests of the 5 Hz wave in one second. Every number comes from A9.MIX (common.js), asserted below; nothing is typed here. */
(function () {
  const V = window.VID;
  const A9 = V.a9;
  const { ramp, flash, lerp, ease: E } = V;
  const MIX = A9.MIX;
  const [SLOW, FAST] = MIX.waves; // {f: 5, a: 1} and {f: 12, a: 0.5}

  // ---- the numbers, from the real mixer ----
  A9.same("scene 2 recipe", MIX.bars, [
    { f: 5, a: 1 },
    { f: 12, a: 0.5 },
  ]);
  const CRESTS = Array.from({ length: SLOW.f }, (_, k) => (k + 0.25) / SLOW.f); // where sin(2 PI 5 t) peaks
  CRESTS.forEach((x, k) => A9.close(`scene 2 crest ${k + 1} is a peak of the 5 Hz wave`, MIX.wave(0, x), SLOW.a, 1e-9));
  A9.same("scene 2 crests counted in one second", CRESTS.length, 5);
  for (let i = 0; i <= 1000; i++)
    if (!(Math.abs(MIX.at(i / 1000)) < 1.7)) throw new Error("VID.a9: scene 2 the wiggle leaves the plot");

  // ---- layout (stage px) ----
  const PX = 70; // px per data unit in the signal panel
  const SIG = { x: 0, y: 0, w: 936, h: 332, pad: { l: 24, r: 240, t: 20, b: 56 } }; // inner area y 20 to 276, baseline y 148
  const HALF = (SIG.h - SIG.pad.t - SIG.pad.b) / 2; // 128
  const BASE = SIG.pad.t + HALF; // 148: the baseline of the merged wiggle
  const A_DY = -24; // the stacked 5 Hz wave: centre line y 124 (crests at y 54, troughs at y 194)
  const B_DY = 90; // the stacked 12 Hz wave: centre line y 238 (between y 203 and y 273)
  const COL = 706; // the tag column
  const tagY = (centre) => centre - 29;

  V.scene({
    kicker: "SIGNALS",
    title: ["One signal,", "two descriptions"],
    dur: 10.5,
    caps: [
      [1.2, 3.0, "Count the waves in one second."],
      [3.7, 5.5, "Two waves added make one wiggle."],
      [6.3, 8.1, "The bars show which waves are inside."],
      [8.4, 10.2, "One signal, two descriptions."],
    ],
    build(stage) {
      // the signal panel: the two waves, then their sum
      const T = A9.plot(stage, {
        ...SIG,
        view: [0, 1, -HALF / PX, HALF / PX],
        axes: "mid",
        xticks: [0, { v: 1, text: "1 s" }],
      });
      const cA = T.curve((t) => MIX.wave(0, t), { tone: "purple", w: 5 });
      const cB = T.curve((t) => MIX.wave(1, t), { tone: "purple", w: 5 });
      const cS = T.curve(MIX.at, { tone: "blue", w: 7 });
      const crest = CRESTS.map(() => T.text({ tone: "grey" }));
      const plus = T.text({ tone: "purple", fs: 52, px: true }); // 'added': between the two stacked waves' tags

      // the frequency panel: one bar per wave
      const F = A9.plot(stage, {
        x: 0,
        y: 356,
        w: 936,
        h: 264,
        view: [0, 16, 0, 1.25],
        axes: "bottom",
        pad: { l: 24, r: 240, t: 20, b: 56 },
        xticks: [
          { v: SLOW.f, text: `${SLOW.f} Hz` },
          { v: FAST.f, text: `${FAST.f} Hz` },
        ],
      });
      const bars = F.bars({ max: 2, bw: 44 });

      // tags in the right-hand column
      const slowTag = A9.tag(stage, { x: COL, y: tagY(BASE + A_DY), text: "5 per second", tone: "purple" });
      const fastTag = A9.tag(stage, { x: COL, y: tagY(BASE + B_DY), text: `${FAST.f} Hz`, tone: "purple" });
      const timeTag = A9.tag(stage, { x: COL, y: tagY(BASE), text: "over time", tone: "blue", solid: true });
      const freqTag = A9.tag(stage, { x: COL, y: 440, text: "by frequency", tone: "orange", solid: true });

      return (t) => {
        // ---- the panel, then the two waves one after the other ----
        const pop = ramp(t, 0.2, 0.6, E.lin);
        T.set({ o: pop, s: 0.96 + 0.04 * E.pop(pop) });
        const merge = ramp(t, 4.0, 5.1, E.inOut); // the stacked waves slide onto the baseline
        const dyA = lerp(A_DY, 0, merge);
        const dyB = lerp(B_DY, 0, merge);
        const aids = 1 - ramp(t, 3.9, 4.2, E.lin); // the crest numbers and the purple tags go (the two waves and the '+' sit on screen as the caption starts)
        const soft = lerp(1, 0.35, ramp(t, 4.7, 5.3, E.lin)); // behind the sum the waves are faint ...
        cA.set({ k: ramp(t, 0.4, 1.2, E.inOut), dy: dyA, o: soft + 0.4 * flash(t, 7.1, 7.7) }); // ... and each lights up when its bar gets its ring
        cB.set({ k: ramp(t, 2.2, 3.0, E.inOut), dy: dyB, o: soft + 0.4 * flash(t, 7.35, 7.95) });
        cS.set({ k: ramp(t, 4.5, 5.5, E.inOut) });

        // ---- counting the crests: one number above each, 0.15 s apart ----
        crest.forEach((c, i) => {
          const k = A9.seq(t, 1.3, 0.15, 0.3, i);
          c.set({
            text: String(i + 1),
            x: CRESTS[i],
            y: SLOW.a,
            dy: dyA - 14,
            o: Math.min(1, k * 4) * aids,
            s: 0.6 + 0.4 * E.pop(k),
          });
        });

        // ---- 'Hz' is five per second: said in words first, then named ----
        const named = t >= 2.9;
        slowTag.set({
          k: ramp(t, 2.0, 2.4, E.lin),
          text: named ? `${SLOW.f} Hz` : "5 per second",
          o: aids,
          s: 1 + 0.1 * flash(t, 2.9, 3.25),
        });
        fastTag.set({ k: ramp(t, 3.0, 3.5, E.lin), o: aids });
        const pk = ramp(t, 3.1, 3.5, E.lin);
        plus.set({
          text: "+",
          x: COL + 48,
          y: (BASE + A_DY + BASE + B_DY) / 2 + 18,
          o: pk * aids,
          s: 0.6 + 0.4 * E.pop(pk),
        });

        // ---- the sum: the one wiggle ----
        timeTag.set({ k: ramp(t, 5.3, 5.8, E.lin), y: -8 * flash(t, 8.6, 9.1) }); // hops on 'One signal,'

        // ---- the bars: how much of each wave is inside ----
        const fp = ramp(t, 5.8, 6.2, E.lin);
        F.set({ o: fp, s: 0.96 + 0.04 * E.pop(fp) });
        bars.set(
          MIX.bars.map((b, i) => ({
            x: b.f,
            v: b.a,
            k: E.out(ramp(t, 6.3 + 0.3 * i, 7.1 + 0.3 * i, E.lin)),
            ring: "purple",
            ringK: ramp(t, 7.2 + 0.2 * i, 7.6 + 0.2 * i, E.lin),
          })),
        );
        freqTag.set({ k: ramp(t, 8.0, 8.5, E.lin), y: -8 * flash(t, 9.3, 9.8) }); // ... and this one on 'two descriptions.' (a hop, not a pulse: the tag stays 12 px inside the stage)
      };
    },
  });
})();

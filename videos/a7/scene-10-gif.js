/* Phase 7 · Information Theory & Compression (algo-7), scene 10: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "GIF IMAGES",
    title: ["Repeats shrink,", "noise does not"],
    dur: 11,
    caps: [
      [0.4, 2.6, "A GIF packs its pixels with LZW."],
      [3.4, 5.2, "Runs of one colour shrink into single codes."],
      [5.8, 8.2, "Noise rarely repeats, so almost nothing shrinks."],
      [8.4, 10.4, "LZW feeds on repeats."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 10 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

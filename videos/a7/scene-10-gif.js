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
      [0.4, 2.6, "A GIF packs its pixel colours with LZW."],
      [2.8, 5.0, "Flat colour: long repeats become single codes."],
      [5.4, 8.0, "Noise has almost no repeats, so almost no saving."],
      [8.5, 10.6, "LZW feeds on repeats."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 10 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

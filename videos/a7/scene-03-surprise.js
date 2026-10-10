/* Phase 7 · Information Theory & Compression (algo-7), scene 03: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "SURPRISE",
    title: ["Rare news carries", "more information"],
    dur: 11,
    caps: [
      [0.4, 2.2, "News we expect tells us nothing: 0 bits."],
      [2.8, 4.8, "Half the chance: one yes-or-no answer, 1 bit."],
      [5.0, 7.8, "Each time the chance halves, one more bit."],
      [8.2, 10.6, "The rarer the news, the more it tells us."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 3 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

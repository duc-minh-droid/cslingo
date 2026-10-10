/* Phase 7 · Information Theory & Compression (algo-7), scene 04: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "ENTROPY",
    title: ["Average surprise", "is the entropy"],
    dur: 12,
    caps: [
      [0.4, 2.6, "A source sends four symbols with these chances."],
      [2.8, 4.4, "Here are eight symbols it sent."],
      [4.6, 6.4, "Each one costs its surprise in bits."],
      [8.0, 9.8, "Fixed: 16 bits. Surprise: only 14."],
      [9.8, 11.6, "1.75 bits a symbol is the floor."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 4 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

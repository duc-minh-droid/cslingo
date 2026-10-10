/* Phase 7 · Information Theory & Compression (algo-7), scene 04: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "ENTROPY",
    title: ["Average surprise", "is the entropy"],
    dur: 12,
    caps: [[0.4, 3.0, "A source sends A, B, C or D with these chances."], [3.2, 5.0, "Here are eight symbols it sent."], [5.2, 7.0, "Each one costs its surprise in bits."], [8.2, 10.0, "Fixed codes need 16 bits. Surprise adds up to 14."], [10.1, 11.8, "That is 1.75 bits a symbol: the floor."]],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 4 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

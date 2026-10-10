/* Phase 7 · Information Theory & Compression (algo-7), scene 02: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "REDUNDANCY",
    title: ["Every letter costs", "the same bits"],
    dur: 10,
    caps: [[0.4, 3.6, "A fixed code spends 3 bits on every letter."], [3.8, 5.6, "That is 21 bits for BBADEBC."], [5.8, 7.8, "But B turns up three times."], [7.9, 9.7, "Common letters get short codes: 15 bits."]],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 2 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

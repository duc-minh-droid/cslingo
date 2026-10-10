/* Phase 7 · Information Theory & Compression (algo-7), scene 07: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "CODEWORDS",
    title: ["Common letters get", "short codes"],
    dur: 12,
    caps: [
      [0.8, 2.8, "Common B sits one step from the root."],
      [2.9, 4.6, "The path down is the code."],
      [5.6, 8.6, "Spell BBADEBC with these codes."],
      [9.6, 11.6, "15 bits instead of 21."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 7 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

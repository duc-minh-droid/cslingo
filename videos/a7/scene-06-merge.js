/* Phase 7 · Information Theory & Compression (algo-7), scene 06: PLACEHOLDER. The scene author replaces build() with the figure
   described in videos/_plan/algo-7.json; the kicker, title, dur and caps below are the storyboard's. */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    kicker: "HUFFMAN CODING",
    title: ["Merge the two rarest,", "again and again"],
    dur: 14,
    caps: [
      [0.4, 2.7, "Each letter has a chance. Join the two smallest."],
      [3.3, 5.3, "Its chance adds to the bits per letter."],
      [5.5, 8.0, "Repeat with the two smallest left."],
      [9.4, 11.0, "One node left: the tree is done."],
      [11.1, 13.6, "1.98 bits a letter, just above the 1.96 floor."],
    ],
    build(stage) {
      const t = A7.tag(stage, { x: 300, y: 280, text: "scene 6 · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

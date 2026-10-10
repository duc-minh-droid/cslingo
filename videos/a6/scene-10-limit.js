/* Phase 6 · scene 10-limit (12.2 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[8].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "THE LIMIT",
    title: ["Hamming fixes one", "error, not two"],
    dur: 12.2,
    caps: [
      [2.2, 3.9, "Two bits flip: positions 2 and 5."],
      [5.5, 7.2, "All fail: 111 means position 7."],
      [7.6, 9, "The repair flips an innocent bit."],
      [9.1, 10.7, "Checks pass, yet the data is wrong."],
      [10.8, 12, "Hamming fixes exactly one error."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 10 · limit", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();

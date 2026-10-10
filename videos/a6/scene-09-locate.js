/* Phase 6 · scene 09-locate (14 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[7].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "HAMMING CODE",
    title: ["The failed checks", "spell the position"],
    dur: 14,
    caps: [
      [0.7, 2.5, "A clean word passes all three checks."],
      [3.3, 4.9, "Noise flips position 6."],
      [5, 6.9, "Recount each group: odd means failed."],
      [8.8, 10.4, "p4 and p2 fail; p1 passes."],
      [10.6, 12.2, "Failures read as binary: 110 is 6."],
      [12.3, 13.9, "Flip position 6 back: fixed."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 09 · locate", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();

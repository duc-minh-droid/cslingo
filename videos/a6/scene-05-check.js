/* Phase 6 · scene 05-check (11 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[3].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "CHECKING",
    title: ["The receiver repeats", "the division"],
    dur: 11,
    caps: [
      [1.1, 2.9, "Divide the frame by the same pattern."],
      [4, 5.6, "Even two flips change the remainder."],
      [7.1, 8.7, "A burst of three is caught too."],
      [9, 10.8, "More check bits catch longer bursts."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 05 · check", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();

/* Phase 6 · scene 03-parity (12.5 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real scene is specified in videos/_plan/algo-6.json (scenes[1].spec). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    kicker: "PARITY",
    title: ["One check bit", "catches one flip"],
    dur: 12.5,
    caps: [
      [1.1, 2.9, "Count the 1s in the message."],
      [3.1, 5.2, "Add a bit that makes the total even."],
      [6.1, 8, "One flip makes the total odd: caught."],
      [8.2, 9.9, "But which bit? Parity cannot say."],
      [10.7, 12.4, "Two flips cancel out: missed."],
    ],
    build(stage) {
      const tag = A6.tag(stage, { x: 300, y: 250, text: "scene 03 · parity", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();

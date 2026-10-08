/* Algorithms Phase 3 · scene 05-bisection: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 5).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "BRACKETING",
    title: ["A slope that flips", "traps the minimum"],
    dur: 12,
    caps: [
      [0.4, 3.4, "Falling left, rising right: a minimum is trapped."],
      [3.6, 6.4, "Test the middle: is the slope still falling?"],
      [6.6, 9.8, "Keep the half where the slope flips."],
      [10.0, 11.6, "Each step halves the bracket."],
    ],
    build(stage) {
      const note = A3.tag(stage, {
        x: 468,
        y: 300,
        text: "scene-05-bisection: placeholder",
        tone: "grey",
        anchor: "m",
      });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();

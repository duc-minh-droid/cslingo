/* Algorithms Phase 3 · scene 08-moves: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 8).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "NELDER–MEAD",
    title: ["A triangle flips", "its worst corner"],
    dur: 14,
    caps: [
      [0.4, 3.0, "Keep a triangle. Flip its worst corner through the middle."],
      [3.2, 6.4, "A great flip? Stretch even further."],
      [6.6, 8.8, "Stretched too far? Keep the plain flip."],
      [9.0, 11.4, "Flip overshoots? Pull the corner in instead."],
      [11.6, 13.6, "Nothing works? Shrink towards the best."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-08-moves: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();

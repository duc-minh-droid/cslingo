/* Algorithms Phase 3 · scene 03-corner: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 3).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "THE SCORE",
    title: ["Slide the profit line", "until it leaves"],
    dur: 12,
    caps: [
      [0.4, 3.0, "Each plan earns a score: z = 3x + 2y."],
      [3.2, 7.2, "Slide the profit line outwards until it leaves."],
      [7.4, 11.4, "It leaves at a corner, so check only the corners."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-03-corner: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();

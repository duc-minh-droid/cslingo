/* Algorithms Phase 3 · scene 04-simplex: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 4).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "SIMPLEX",
    title: ["Walk corner to corner,", "never the middle"],
    dur: 15,
    caps: [
      [0.4, 3.4, "Start at a corner. Which direction gains most?"],
      [3.6, 7.6, "Walk until the nearest rule blocks the way."],
      [7.8, 10.4, "Repeat from the new corner."],
      [10.6, 14.2, "No direction gains: the corner is optimal."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-04-simplex: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();

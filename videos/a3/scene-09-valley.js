/* Algorithms Phase 3 · scene 09-valley: PLACEHOLDER (replace build() with the scene in videos/_plan/algo-3.json, "n": 9).
   The kicker, title, duration and captions below are final; keep them. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    kicker: "NELDER–MEAD",
    title: ["It crawls down", "a curved valley"],
    dur: 13,
    caps: [
      [0.4, 3.0, "Real problems have curved valleys, not simple bowls."],
      [3.2, 6.4, "The triangle stretches along the valley."],
      [6.6, 9.8, "Near the bottom it shrinks to a tiny triangle."],
      [10.0, 12.4, "No derivatives needed, just comparisons."],
    ],
    build(stage) {
      const note = A3.tag(stage, { x: 468, y: 300, text: "scene-09-valley: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ s: 0.8 + 0.2 * V.ease.pop(V.ramp(t, 0.2, 0.8)), o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();

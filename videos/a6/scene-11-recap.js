/* Phase 6 · scene 11-recap (9 s): PLACEHOLDER written by the architect so the page loads and the total length is right.
   The real recap (three rows of small animated pictograms, like videos/a4/scene-11-recap.js) is specified in
   videos/_plan/algo-6.json (recap.spec and recap.points). Replace build() with the real drawing. */
(function () {
  const V = window.VID;
  const A6 = V.a6;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const tag = A6.tag(stage, { x: 372, y: 520, text: "scene 11 · recap", tone: "grey" });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.7) });
    },
  });
})();

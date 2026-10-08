/* Algorithms Phase 3 · scene 10-recap: PLACEHOLDER (replace build() with the recap in videos/_plan/algo-3.json). Bare scene, 9 s. */
(function () {
  const V = window.VID;
  const A3 = V.a3;

  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const note = A3.tag(stage, { x: 540, y: 520, text: "scene-10-recap: placeholder", tone: "grey", anchor: "m" });
      return (t) => note.set({ o: V.ramp(t, 0.2, 0.5) });
    },
  });
})();

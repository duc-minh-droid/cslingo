/* Lecture 5 · Partitioning, scene-11-recap (9 s): PLACEHOLDER written by the architect, to be replaced by the scene author (spec: videos/_plan/ds-5.json, "recap"). */
(function () {
  const V = window.VID;
  const D5 = V.d5;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const tag = D5.tag(stage, { x: 380, y: 520, text: "recap placeholder", tone: "blue", solid: true });
      return (t) => tag.set({ k: V.ramp(t, 0.2, 0.6) });
    },
  });
})();

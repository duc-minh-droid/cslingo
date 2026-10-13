/* Phase 7 · Information Theory & Compression (algo-7), scene 11-recap: PLACEHOLDER. The scene author replaces build() with the
   recap card described in videos/_plan/algo-7.json (three rows of small animated pictograms). */
(function () {
  const V = window.VID;
  const A7 = V.a7;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const t = A7.tag(stage, { x: 330, y: 500, text: "scene 11 · recap · placeholder", tone: "blue", solid: true });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

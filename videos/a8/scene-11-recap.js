/* Phase 8 · scene 11 recap: PLACEHOLDER written by the architect. The scene author replaces this file with the real recap
   (spec: videos/_plan/algo-8.json, "recap"): a bare scene with three rows of small animated SVG pictograms, like
   videos/a4/scene-11-recap.js. It only keeps the page loadable and the total length right. */
(function () {
  const V = window.VID;
  const A8 = V.a8;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const t = A8.tag(stage, { x: 540, y: 540, text: "placeholder: recap", tone: "grey", fs: 40 });
      return (lt) => t.set({ k: V.ramp(lt, 0.2, 0.7) });
    },
  });
})();

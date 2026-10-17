/* Lecture 7 · scene-11-recap: PLACEHOLDER (the scene author replaces build()). The storyboard is videos/_plan/lecture-7.json, recap.
   A bare scene (full 1080 x 1080 stage): three rows of small animated SVG pictograms like videos/l5/scene-10-recap.js. */
(function () {
  const V = window.VID;
  const L7 = V.l7;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const c = L7.card(stage, {
        x: 240,
        y: 440,
        w: 600,
        h: 120,
        text: "scene-11-recap (placeholder)",
        tone: "blue",
        plain: true,
        fs: 32,
      });
      return (t) => c.set({ k: V.ramp(t, 0.1, 0.5) });
    },
  });
})();

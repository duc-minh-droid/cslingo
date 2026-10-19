/* Lecture 1 (ds-1), recap: PLACEHOLDER written by the architect (bare scene). The author replaces it following videos/_plan/ds-1.json -> recap. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    bare: true,
    dur: 9,
    build(stage) {
      const box = D1.card(stage, {
        x: 290,
        y: 440,
        w: 500,
        h: 160,
        text: "recap placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();

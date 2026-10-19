/* Lecture 1 (ds-1), scene 09: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[7].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "SCALABILITY",
    title: ["Scale up or", "scale out?"],
    dur: 11,
    caps: [
      [0.5, 3.0, "Need 8 times the power of one machine."],
      [3.2, 5.4, "Scale up costs more: \u00a334,297 vs \u00a38,800."],
      [5.8, 7.6, "One dies: 0% left, or 88% left."],
      [8.0, 10.6, "At 40 times, no single machine exists."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 9 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();

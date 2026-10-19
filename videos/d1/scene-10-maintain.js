/* Lecture 1 (ds-1), scene 10: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[8].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "MAINTAINABILITY",
    title: ["Maintainable systems", "are easy to change"],
    dur: 12.2,
    caps: [
      [0.5, 2.9, "Three kinds of easy: run, understand, change."],
      [3.4, 5.4, "Every service talks to every database."],
      [5.6, 7.6, "Swap one database: edit all five."],
      [7.8, 9.8, "One layer in between: 9 connections."],
      [10.0, 11.9, "Now only the layer changes."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 10 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();

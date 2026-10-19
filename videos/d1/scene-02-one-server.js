/* Lecture 1 (ds-1), scene 02: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[0].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "WHY IT'S HARD",
    title: ["One server can't", "keep up or stay up"],
    dur: 10,
    caps: [
      [0.5, 3.2, "One big server does all the work."],
      [3.5, 5.6, "Too many requests get dropped."],
      [5.9, 7.9, "One crash, and everything is down."],
      [8.1, 9.8, "Even repairs take it offline."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 2 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();

/* Lecture 1 (ds-1), scene 07: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[5].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "SCALABILITY",
    title: ["Judge speed by the spread,", "not the average"],
    dur: 12.5,
    caps: [
      [0.5, 2.5, "100 requests, each timed."],
      [3.0, 4.8, "Most are quick; a few are slow."],
      [4.9, 6.6, "The average is 250 ms."],
      [6.7, 8.5, "p95: 95 in 100 are faster."],
      [8.6, 10.2, "p99: 99 in 100 are faster."],
      [10.3, 12.2, "The average hides the slowest."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 7 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();

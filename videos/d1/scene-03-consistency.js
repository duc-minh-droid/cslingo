/* Lecture 1 (ds-1), scene 03: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[1].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "TRADE-OFF 1",
    title: ["Copies drift apart:", "consistent or available?"],
    dur: 11.5,
    caps: [
      [0.5, 2.8, "Two copies, kept in step by a link."],
      [3.0, 4.6, "Now the link is cut."],
      [4.7, 7.0, "London sells a ticket; New York never hears."],
      [7.5, 9.2, "Stay consistent: refuse to answer."],
      [9.3, 11.3, "Stay available: answer, maybe stale."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 3 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();

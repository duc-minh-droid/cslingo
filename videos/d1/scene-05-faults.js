/* Lecture 1 (ds-1), scene 05: PLACEHOLDER written by the architect (labelled sticker, right length, kicker, title and captions).
   The scene author replaces this file following videos/_plan/ds-1.json -> scenes[3].spec. */
(function () {
  const V = window.VID;
  const D1 = V.d1;
  V.scene({
    kicker: "RELIABILITY",
    title: ["Faults are normal,", "failures are not"],
    dur: 11.5,
    caps: [
      [0.5, 3.0, "10,000 disks: about one dies every day."],
      [3.2, 5.0, "A dead disk is a fault."],
      [5.0, 7.2, "One copy: a dead disk means a failure."],
      [7.5, 9.4, "Two copies: users notice nothing."],
      [9.6, 11.3, "Faults must not become failures."],
    ],
    build(stage) {
      const box = D1.card(stage, {
        x: 218,
        y: 240,
        w: 500,
        h: 160,
        text: "scene 5 placeholder",
        tone: "blue",
        plain: false,
        fs: 32,
      });
      return (t) => box.set({ k: V.ramp(t, 0.2, 0.8, V.ease.lin) });
    },
  });
})();
